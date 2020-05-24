import { PackageTrackingInfo as IPackageTrackingInfo, PackageTrackingInfoPOJO } from "../../../public";
import { App, DefinitionIdentifier, Dimensions, hideAndFreeze, Joi, Weight, _internal } from "../../common";
import { Packaging } from "../packaging";

export class PackageTrackingInfo implements IPackageTrackingInfo {
  public static readonly [_internal] = {
    label: "package",
    schema: Joi.object({
      packaging: DefinitionIdentifier[_internal].schema.unknown(true),
      dimensions: Dimensions[_internal].schema,
      weight: Weight[_internal].schema,
    }),
  };

  public readonly packaging?: Packaging;
  public readonly dimensions?: Dimensions;
  public readonly weight?: Weight;

  public constructor(pojo: PackageTrackingInfoPOJO, app: App) {
    this.packaging = app[_internal].references.lookup(pojo.packaging, Packaging);
    this.dimensions = pojo.dimensions && new Dimensions(pojo.dimensions);
    this.weight = pojo.weight && new Weight(pojo.weight);

    // Make this object immutable
    hideAndFreeze(this);
  }
}
