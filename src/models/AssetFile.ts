import { EntityType } from "./../enums/EntityType";
import { AssetFileType } from "./../enums/AssetFileType";
import db from "./../db/db";

export interface AssetFileProps {
  id?: number;
  entityId?: number;
  entityType?: EntityType;
  fileUrl?: string;
  fileType?: AssetFileType;
  name?: string;
  language?: string;
  fileSize?: number;
  duration?: number;
}

export class AssetFile {
  constructor(private props: AssetFileProps) {}

  private validateEntityType(props: AssetFileProps): void {
    if (
      props.entityType !== undefined &&
      !Object.values(EntityType).includes(props.entityType)
    ) {
      throw new Error(
        `Invalid entityType: "${
          props.entityType
        }". Must be one of: ${Object.values(EntityType).join(", ")}`
      );
    }
  }

  private validateAssetType(props: AssetFileProps): void {
    if (
      props.fileType !== undefined &&
      !Object.values(AssetFileType).includes(props.fileType)
    ) {
      throw new Error(
        `Invalid fileType: "${props.fileType}". Must be one of: ${Object.values(
          AssetFileType
        ).join(", ")}`
      );
    }
  }

  get id() {
    return this.props.id;
  }

  get entityId() {
    return this.props.entityId;
  }

  set entityId(entityId: number | undefined) {
    this.props.entityId = entityId;
  }

  get entityType() {
    return this.props.entityType;
  }

  get fileUrl() {
    return this.props.fileUrl;
  }

  get fileType() {
    return this.props.fileType;
  }

  get name() {
    return this.props.name;
  }

  get language() {
    return this.props.language;
  }

  set entityType(entityType: EntityType | undefined) {
    this.validateEntityType({ ...this.props, entityType });
    this.props.entityType = entityType;
  }

  set fileType(fileType: AssetFileType | undefined) {
    this.validateAssetType({ ...this.props, fileType });
    this.props.fileType = fileType;
  }

  get fileSize() {
    return this.props.fileSize;
  }

  get duration() {
    return this.props.duration;
  }

  toJSON() {
    return {
      id: this.id,
      entityId: this.entityId,
      entityType: this.entityType,
      fileUrl: this.fileUrl,
      fileType: this.fileType,
      name: this.name,
      language: this.language,
      fileSize: this.fileSize,
      duration: this.duration,
    };
  }

  static fromRaw(raw: any): AssetFile {
    return new AssetFile({
      id: raw.id,
      entityId: raw.entity_id,
      entityType: raw.entity_type,
      fileUrl: raw.file_url,
      fileType: raw.file_type,
      name: raw.name,
      language: raw.language,
      fileSize: raw.file_size,
      duration: raw.duration,
    });
  }

  save(): AssetFile {
    const query = db.prepare(`
      INSERT INTO asset_files (id, entity_id, entity_type, file_url, file_type, name, language, file_size, duration)
      VALUES (@id, @entityId, @entityType, @fileUrl, @fileType, @name, @language, @fileSize, @duration)
      ON CONFLICT(id) DO UPDATE SET 
        entity_id = excluded.entity_id,
        entity_type = excluded.entity_type,
        file_url = excluded.file_url,
        file_type = excluded.file_type,
        name = excluded.name,
        language = excluded.language,
        file_size = excluded.file_size,
        duration = excluded.duration
    `);

    const result = query.run({
      id: this.id || null,
      entityId: this.entityId,
      entityType: this.entityType,
      fileUrl: this.fileUrl,
      fileType: this.fileType,
      name: this.name,
      language: this.language,
      fileSize: this.fileSize,
      duration: this.duration,
    });

    if (!this.id && result.lastInsertRowid) {
      this.props.id = result.lastInsertRowid as number;
    }

    return this;
  }
}
