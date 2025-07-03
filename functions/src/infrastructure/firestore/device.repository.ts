import { IDeviceRepository } from "../../domain/device/i-device.repository";
import { Device } from "../../domain/device/device.entity";
import { Location } from "../../domain/shared/value-object/Location.value";

import { geohashQueryBounds, distanceBetween } from 'geofire-common';
import * as FirebaseFirestore from '@google-cloud/firestore';
import {
  getFirestore,
  Query,
  DocumentData,
  QuerySnapshot,
  GeoPoint,
} from 'firebase-admin/firestore'; 
import { DeviceToken } from "../../domain/device/device-token.value";
import { UserId } from "../../domain/user/user-id.value";
import { IClock } from "../../domain/shared/service/i-clock.service";
import { DeviceId } from "../../domain/device/device-id.value";
import { DevicesCollection } from "../../domain/device/devices.collection";
export class DeviceRepository implements IDeviceRepository {
  private constructor(
    private readonly db: FirebaseFirestore.Firestore,
    private readonly clock: IClock
  ) {}
  static create(
    db: FirebaseFirestore.Firestore,
    clock: IClock
  ): DeviceRepository {
    return new DeviceRepository(db, clock);
  }

  async save(device: Device): Promise<Device> {
    const docRef = this.db.collection('users')
                    .doc(device.ownerId.toString())
                    .collection('devices')
                    .doc(device.id.toString());

    const deviceData = {
      ownerId: device.ownerId.toString(),
      fcmToken: device.deviceToken.toString(),
      location: new GeoPoint(device.location.latitude, device.location.longitude),
      geohash: device.location.calcGeohash(),
      lastUpdatedAt: this.clock.now(),
    }
    await docRef.set(deviceData);
    return device;
  }

  async findAvailableNearBy(
    center: Location,
    radiusInM: number
  ): Promise<DevicesCollection> {
    const bounds = geohashQueryBounds([center.latitude, center.longitude], radiusInM);

    const promises: Promise<QuerySnapshot<DocumentData>>[] = [];
    
    for (const b of bounds) {
      const q: Query<DocumentData> = this.db
        .collectionGroup('devices') // ★★★ this.db.collectionGroup() でクエリを開始 ★★★
        .orderBy('geohash')
        .startAt(b[0])
        .endAt(b[1]);
      promises.push(q.get()); // ★★★ メソッド名が getDocs から get に変わる ★★★
    }

    const snapshots = await Promise.all(promises);

    const matchingDocs = new Map<string, DocumentData>();
    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        // ここでの重複除去は同じ
        matchingDocs.set(doc.id, doc.data());
      }
    }

    const finalResults = DevicesCollection.create();
    for (const [id, data] of matchingDocs.entries()) {
      const docLocation = data.location as GeoPoint;
      
      const distanceInM = distanceBetween(
        [docLocation.latitude, docLocation.longitude],
        [center.latitude, center.longitude]
      ) * 1000;

      if (distanceInM <= radiusInM) {
        finalResults.add(Device.create(
          DeviceId.create(id),
          UserId.create(data.ownerId),
          DeviceToken.create(data.fcmToken),
          Location.create({ latitude: docLocation.latitude, longitude: docLocation.longitude }),
          new Date(data.lastUpdatedAt),
          this.clock
        ));
      }
    }

    return finalResults;
  }

  async findById(deviceId: DeviceId): Promise<Device | null> {
    const snapshot = await this.db.collectionGroup('devices').where('id', '==', deviceId.value).get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return Device.create(
      DeviceId.create(doc.id),
      UserId.create(doc.data().ownerId),
      DeviceToken.create(doc.data().fcmToken),
      Location.create({
        latitude: doc.data().location.latitude,
        longitude: doc.data().location.longitude,
      }),
      new Date(doc.data().lastUpdatedAt),
      this.clock
    );
  }
}