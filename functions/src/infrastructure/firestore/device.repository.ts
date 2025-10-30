import {IDeviceRepository} from "../../domain/device/i-device.repository.js";
import {Device} from "../../domain/device/device.entity.js";
import {Location} from "../../domain/shared/value-object/Location.value.js";

import {geohashQueryBounds, distanceBetween} from "geofire-common";
import {
  Firestore,
  Query,
  DocumentData,
  QuerySnapshot,
  GeoPoint,
} from "firebase-admin/firestore";
import {DeviceToken} from "../../domain/device/device-token.value";
import {UserId} from "../../domain/user/user-id.value";
import {IClock} from "../../domain/shared/service/i-clock.service";
import {DeviceId} from "../../domain/device/device-id.value";
import {DevicesCollection} from "../../domain/device/devices.collection";
import {logger} from "firebase-functions";

export class DeviceRepository implements IDeviceRepository {
  private constructor(
    private readonly db: Firestore,
    private readonly clock: IClock
  ) {}
  static create(
    db: Firestore,
    clock: IClock
  ): DeviceRepository {
    return new DeviceRepository(db, clock);
  }

  async save(device: Device): Promise<Device> {
    logger.info("DeviceRepository.save called with device:", device);
    const docRef = this.db.collection("devices").doc(device.id.toString());

    const deviceData = {
      ownerId: device.ownerId.toString(),
      fcmToken: device.deviceToken.toString(),
      location: new GeoPoint(
        device.location.latitude,
        device.location.longitude,
      ),
      geohash: device.location.calcGeohash(),
      lastUpdatedAt: this.clock.now(),
    };
    await docRef.set(deviceData);
    logger.info("DeviceRepository.save completed for device:", device.id.toString());
    return device;
  }

  async findAvailableNearBy(
    center: Location,
    radiusInM: number,
  ): Promise<DevicesCollection> {
    logger.info(`DeviceRepository.findAvailableNearBy called with center: ${JSON.stringify(center)}, radiusInM: ${radiusInM}`);
    const bounds = geohashQueryBounds(
      [center.latitude, center.longitude],
      radiusInM,
    );

    const promises: Promise<QuerySnapshot<DocumentData>>[] = [];

    for (const b of bounds) {
      const q: Query<DocumentData> = this.db
        .collection("devices")
        .orderBy("geohash")
        .startAt(b[0])
        .endAt(b[1]);
      promises.push(q.get());
    }

    const snapshots = await Promise.all(promises);

    const matchingDocs = new Map<string, DocumentData>();
    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        matchingDocs.set(doc.id, doc.data());
      }
    }
    logger.info(`DeviceRepository.findAvailableNearBy found ${matchingDocs.size} docs in geohash bounds`);

    // Collect unique ownerIds from device docs
    const ownerIdSet = new Set<string>();
    for (const [, data] of matchingDocs.entries()) {
      if (data && data.ownerId) ownerIdSet.add(data.ownerId);
    }

    // Fetch user docs for those ownerIds to determine role
    const ownerIds = Array.from(ownerIdSet);
    const ownerRoleMap = new Map<string, string | undefined>();
    if (ownerIds.length > 0) {
      const userDocPromises = ownerIds.map((ownerId) =>
        this.db.collection("users").doc(ownerId).get()
      );
      const userDocs = await Promise.all(userDocPromises);
      userDocs.forEach((snap) => {
        const id = snap.id;
        const data = snap.data();
        ownerRoleMap.set(id, data?.role);
      });
    }
    logger.info(`DeviceRepository.findAvailableNearBy fetched roles for ${ownerIds.length} owners`);

    const finalResults = DevicesCollection.create();
    for (const [id, data] of matchingDocs.entries()) {
      const docLocation = data.location as GeoPoint;

      const distanceInM =
        distanceBetween(
          [docLocation.latitude, docLocation.longitude],
          [center.latitude, center.longitude],
        ) * 1000;

      if (distanceInM <= radiusInM) {
        const ownerId = data.ownerId;
        const ownerRole = ownerRoleMap.get(ownerId);
        // Only include devices whose owner role is "supporter"
        if (ownerRole !== "supporter") {
          continue;
        }

        finalResults.add(
          Device.create(
            DeviceId.create(id),
            UserId.create(data.ownerId),
            DeviceToken.create(data.fcmToken),
            Location.create({
              latitude: docLocation.latitude,
              longitude: docLocation.longitude,
            }),
            new Date(data.lastUpdatedAt),
            this.clock,
          ),
        );
      }
    }
    logger.info(`DeviceRepository.findAvailableNearBy returning ${finalResults.length} devices`);
    return finalResults;
  }

  async findById(deviceId: DeviceId): Promise<Device | null> {
    logger.info("DeviceRepository.findById called with deviceId:", deviceId.toString());
    const docRef = this.db.collection("devices").doc(deviceId.toString());
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      logger.info("DeviceRepository.findById device not found for id:", deviceId.toString());
      return null;
    }

    const data = snapshot.data();
    if (!data) {
      logger.info("DeviceRepository.findById data not found for id:", deviceId.toString());
      return null;
    }

    const device = Device.create(
      DeviceId.create(snapshot.id),
      UserId.create(data.ownerId),
      DeviceToken.create(data.fcmToken),
      Location.create({
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      }),
      new Date(data.lastUpdatedAt),
      this.clock,
    );
    logger.info("DeviceRepository.findById returning device:", device);
    return device;
  }

  async nextIdentity(): Promise<DeviceId> {
    logger.info("DeviceRepository.nextIdentity called");
    const docRef = this.db.collection("devices").doc();
    const deviceId = DeviceId.create(docRef.id);
    logger.info("DeviceRepository.nextIdentity returning deviceId:", deviceId.toString());
    return deviceId;
  }

  async delete(deviceId: DeviceId): Promise<void> {
    logger.info("DeviceRepository.delete called with deviceId:", deviceId.toString());
    const docRef = this.db.collection("devices").doc(deviceId.toString());
    await docRef.delete();
    logger.info("DeviceRepository.delete completed for deviceId:", deviceId.toString());
  }
}
