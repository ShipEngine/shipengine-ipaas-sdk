import { AddressWithContactInfo, App, DateTimeZone, MonetaryValue } from "../../common";
import { FulfillmentService } from "../../enums";
import { hideAndFreeze, Joi, _internal } from "../../internal";
import { DeliveryConfirmation } from "../delivery-confirmation";
import { DeliveryService } from "../delivery-service";
import { ShipmentIdentifier } from "../shipments/shipment-identifier";
import { calculateTotalInsuranceAmount } from "../utils";
import { PackageRateCriteria } from "./package-rate-criteria";
import { RateCriteriaPOJO } from "./rate-criteria-pojo";

/**
 * Specifies the criteria for rate quotes
 */
export class RateCriteria {
  //#region Private/Internal Fields

  /** @internal */
  public static readonly [_internal] = {
    label: "shipment",
    schema: Joi.object({
      deliveryServices: Joi.array().items(Joi.string().uuid()),
      deliveryConfirmations: Joi.array().items(Joi.string().uuid()),
      fulfillmentServices: Joi.array().items(Joi.string().enum(FulfillmentService)),
      shipDateTime: DateTimeZone[_internal].schema.required(),
      deliveryDateTime: DateTimeZone[_internal].schema,
      shipFrom: AddressWithContactInfo[_internal].schema.required(),
      shipTo: AddressWithContactInfo[_internal].schema.required(),
      returns: Joi.object({
        isReturn: Joi.boolean(),
        outboundShipment: ShipmentIdentifier[_internal].schema,
      }),
      packages: Joi.array().min(1).items(PackageRateCriteria[_internal].schema).required(),
    }),
  };

  //#endregion
  //#region Public Fields

  /**
   * The delivery services that may be used. If neither `deliveryServices` nor
   * `fulfillmentServices` are specified, then rate quotes should be returned for all
   * applicable services.
   */
  public readonly deliveryServices: ReadonlyArray<DeliveryService>;

  /**
   * The delivery confirmations that may be used. If not specified, then rate quotes
   * should be returned for all applicable delivery confirmations.
   */
  public readonly deliveryConfirmations: ReadonlyArray<DeliveryConfirmation>;

  /**
   * Well-known carrier services that may be used to fulfill the shipment.
   * If neither `deliveryServices` nor `fulfillmentServices` are specified, then rate quotes
   * should be returned for all applicable services.
   */
  public readonly fulfillmentServices: ReadonlyArray<FulfillmentService>;

  /**
   * The date/time that the shipment is expected to ship.
   * This is not guaranteed to be in the future.
   */
  public readonly shipDateTime: DateTimeZone;

  /**
   * The latest date and time that the shipment can be delivered
   */
  public readonly deliveryDateTime?: DateTimeZone;

  /**
   * The sender's contact info and address
   */
  public readonly shipFrom: AddressWithContactInfo;

  /**
   * The recipient's contact info and address
   */
  public readonly shipTo: AddressWithContactInfo;

  /**
   * The total insured value of all packages in the shipment.
   * If specified, then rate quotes should include carrier-provided insurance.
   */
  public readonly totalInsuredValue?: MonetaryValue;

  /**
   * Return shipment details
   */
  public readonly returns: {
    /**
     * Indicates whether this is a return shipment
     */
    readonly isReturn: boolean;

    /**
     * The original (outgoing) shipment that this return shipment is for.
     * This associates the two shipments, which is required by some carriers.
     */
    readonly outboundShipment?: Readonly<ShipmentIdentifier>;
  };

  /**
   * The list of packages in the shipment
   */
  public readonly packages: ReadonlyArray<PackageRateCriteria>;

  //#endregion

  public constructor(pojo: RateCriteriaPOJO, app: App) {
    this.deliveryServices = (pojo.deliveryServices || [])
      .map((id) => app[_internal].references.lookup(id, DeliveryService));
    this.deliveryConfirmations = (pojo.deliveryConfirmations || [])
      .map((id) => app[_internal].references.lookup(id, DeliveryConfirmation));
    this.fulfillmentServices = pojo.fulfillmentServices || [];
    this.shipDateTime = new DateTimeZone(pojo.shipDateTime);
    this.deliveryDateTime = pojo.deliveryDateTime ? new DateTimeZone(pojo.deliveryDateTime) : undefined;
    this.shipFrom = new AddressWithContactInfo(pojo.shipFrom);
    this.shipTo = new AddressWithContactInfo(pojo.shipTo);

    // If there's no return info, then the shipment is not a return
    let returns = pojo.returns || {};
    this.returns = {
      isReturn: returns.isReturn || false,
      outboundShipment: returns.outboundShipment && new ShipmentIdentifier(returns.outboundShipment),
    };

    this.packages = pojo.packages.map((parcel) => new PackageRateCriteria(parcel, app));
    this.totalInsuredValue = calculateTotalInsuranceAmount(this.packages);

    // Make this object immutable
    hideAndFreeze(this);
    Object.freeze(this.returns.outboundShipment);
  }
}

// Prevent modifications to the class
hideAndFreeze(RateCriteria);