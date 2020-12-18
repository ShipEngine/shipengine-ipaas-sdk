import { AddressWithContactInfoPOJO, DateTimeZonePOJO, DeliveryServiceIdentifierPOJO, NewShipment as INewShipment, DeliveryConfirmationIdentifierPOJO, DeliveryConfirmationType } from "../../../public";
import { AddressWithContactInfo, App, DateTimeZone, DefinitionIdentifier, hideAndFreeze, Joi, MonetaryValue, _internal } from "../../common";
import { DeliveryService } from "../delivery-service";
import { NewPackage, NewPackagePOJO } from "../packages/new-package";
import { calculateTotalInsuranceAmount } from "../utils";
import { DeliveryConfirmation } from "../delivery-confirmation";
import { ShippingOptions } from "../../../public/carriers/types";

export interface NewShipmentPOJO {
  deliveryService: DeliveryServiceIdentifierPOJO | string;
  shipFrom: AddressWithContactInfoPOJO;
  shipTo: AddressWithContactInfoPOJO;
  returnTo?: AddressWithContactInfoPOJO;
  shipDateTime: DateTimeZonePOJO | Date | string;
  returns?: {
    isReturn?: boolean;
    rmaNumber?: string;
  };
  packages: readonly NewPackagePOJO[];
  deliveryConfirmation?: DeliveryConfirmationIdentifierPOJO | DeliveryConfirmationType;
  shippingOptions?: ShippingOptions;
}


export class NewShipment implements INewShipment {
  public static readonly [_internal] = {
    label: "shipment",
    schema: Joi.object({
      deliveryService: Joi.alternatives(
        DefinitionIdentifier[_internal].schema.unknown(true),
        Joi.string()
      ).required(),
      shipFrom: AddressWithContactInfo[_internal].schema.required(),
      shipTo: AddressWithContactInfo[_internal].schema.required(),
      returnTo: AddressWithContactInfo[_internal].schema,
      shipDateTime: DateTimeZone[_internal].schema.required(),
      returns: Joi.object({
        isReturn: Joi.boolean(),
        rmaNumber: Joi.string().trim().singleLine().allow("")
      }),
      deliveryConfirmation: Joi.alternatives(
        DefinitionIdentifier[_internal].schema.unknown(true),
        Joi.string()
      ),
      packages: Joi.array().min(1).items(NewPackage[_internal].schema).required(),
      shippingOptions: Joi.object({
        dangerousGoodsCategory: Joi.string().optional(),
        billDutiesToSender: Joi.boolean().optional(),
      })
    }),
  };

  public readonly deliveryService: DeliveryService;
  public readonly shipFrom: AddressWithContactInfo;
  public readonly shipTo: AddressWithContactInfo;
  public readonly returnTo: AddressWithContactInfo;
  public readonly shipDateTime: DateTimeZone;
  public readonly totalInsuredValue: MonetaryValue;
  public readonly deliveryConfirmation?: DeliveryConfirmation;
  public readonly shippingOptions: ShippingOptions;

  public get isNonMachinable(): boolean {
    return this.packages.some((pkg) => pkg.isNonMachinable);
  }

  public readonly returns: {
    readonly isReturn: boolean;
    readonly rmaNumber: string;
  };

  public readonly packages: readonly NewPackage[];

  public get package(): NewPackage {
    return this.packages[0];
  }

  public constructor(pojo: NewShipmentPOJO, app: App) {
    this.deliveryService = app[_internal].references.lookup(pojo.deliveryService, DeliveryService);
    this.shipFrom = new AddressWithContactInfo(pojo.shipFrom);
    this.shipTo = new AddressWithContactInfo(pojo.shipTo);
    this.returnTo = pojo.returnTo ? new AddressWithContactInfo(pojo.returnTo) : this.shipFrom;
    this.shipDateTime = new DateTimeZone(pojo.shipDateTime);

    this.deliveryConfirmation = app[_internal].references.lookup(pojo.deliveryConfirmation, DeliveryConfirmation);

    // If there's no return info, then the shipment is not a return
    const returns = pojo.returns || {};
    this.returns = {
      isReturn: returns.isReturn || false,
      rmaNumber: returns.rmaNumber || ""
    };

    this.packages = pojo.packages.map((parcel) => new NewPackage(parcel, app));
    this.totalInsuredValue = calculateTotalInsuranceAmount(this.packages);

    this.shippingOptions = pojo.shippingOptions || {};

    // Make this object immutable
    hideAndFreeze(this);
  }
}
