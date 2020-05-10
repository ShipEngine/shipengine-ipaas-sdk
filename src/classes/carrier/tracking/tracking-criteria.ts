import { hideAndFreeze, Joi, validate, _internal } from "../../../internal";
import { TrackingCriteriaPOJO } from "../../../pojos/carrier";
import { ShipmentIdentifier } from "../shipments/shipment-identifier";

/**
 * Specifies the criteria for requesting tracking information about a shipment
 */
export class TrackingCriteria {
  //#region Private/Internal Fields

  /** @internal */
  public static readonly [_internal] = {
    label: "tracking criteria",
    schema: Joi.object({
      shipment: ShipmentIdentifier[_internal].schema.required(),
    }),
  };

  //#endregion
  //#region Public Fields

  /**
   * The shipment to get tracking information for
   */
  public readonly shipment: ShipmentIdentifier;

  //#endregion

  public constructor(pojo: TrackingCriteriaPOJO) {
    validate(pojo, TrackingCriteria);

    this.shipment = new ShipmentIdentifier(pojo.shipment);

    // Make this object immutable
    hideAndFreeze(this);
  }
}

// Prevent modifications to the class
hideAndFreeze(TrackingCriteria);
