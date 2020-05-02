import { DocumentFormat, DocumentSize } from "../../enums";
import { DocumentPOJO } from "../../pojos/carrier";
import { Joi } from "../../validation";
import { hideAndFreeze, _internal } from "../utils";

/**
 * A document that is associated with a shipment or package, such as a customs form.
 */
export class Document {
  //#region Private/Internal Fields

  /** @internal */
  public static readonly [_internal] = {
    label: "document",
    schema: Joi.object({
      size: Joi.string().enum(DocumentSize).required(),
      format: Joi.string().enum(DocumentFormat).required(),
      data: Joi.object().instance(Buffer).required(),
    }),
  };

  //#endregion
  //#region Public Fields

  /**
   * The dimensions of the document
   */
  public readonly size: DocumentSize;

  /**
   * The file format of the document
   */
  public readonly format: DocumentFormat;

  /**
   * The document data, in the specified file format
   */
  public readonly data: Buffer;

  //#endregion

  public constructor(pojo: DocumentPOJO) {
    this.size = pojo.size;
    this.format = pojo.format;
    this.data = pojo.data;

    // Make this object immutable
    hideAndFreeze(this);
  }
}

// Prevent modifications to the class
hideAndFreeze(Document);