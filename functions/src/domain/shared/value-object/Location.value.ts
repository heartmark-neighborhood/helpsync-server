import { z } from 'zod';
import { geohashForLocation, geohashQueryBounds } from 'geofire-common';

export const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  geohash: z.string().optional()
});
type LocationProps = z.infer<typeof LocationSchema>;

export class Location {
  public readonly latitude: number;
  public readonly longitude: number;

  private constructor(props: LocationProps) {
    this.latitude = props.latitude;
    this.longitude = props.longitude;
  }

  public static create(props: LocationProps): Location {
    const validatedProps = LocationSchema.parse(props);
    return new Location(validatedProps);
  }


  public calcGeohash(): string {
    return geohashForLocation([this.latitude, this.longitude]);
  }

  public getQueryBounds(radiusInM: number): string[][] {
    return geohashQueryBounds([this.latitude, this.longitude], radiusInM);
  }

  public toPersistenceModel(): LocationProps {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      geohash: this.calcGeohash()
    };
  }

  public equals(other: Location): boolean {
    return this.latitude === other.latitude && this.longitude === other.longitude;
  }
}