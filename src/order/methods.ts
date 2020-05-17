import { Transaction } from "../common";

/**
 * Returns detailed information about a seller on the marketplace
 */
export type GetSeller = (transaction: Transaction, arg2: unknown) => void | Promise<void>;

/**
 * Returns a specific sales order
 */
export type GetSalesOrder = (transaction: Transaction, arg2: unknown) => void | Promise<void>;

/**
 * Returns all orders that were created and/or modified within a given timeframe
 */
export type GetSalesOrderByDate = (transaction: Transaction, arg2: unknown) => void | Promise<void>;

/**
 * Called when a shipment is created for one or more items in one or more sales orders.
 *
 * A single shipment may contain items from multiple sales orders, and a single sales order
 * may be fulfilled by multiple shipments.
 */
export type ShipmentCreated = (transaction: Transaction, arg2: unknown) => void | Promise<void>;

/**
 * Called when a shipment is canceled for one or more items in one or more sales orders.
 *
 * A single shipment may contain items from multiple sales orders, and a single sales order
 * may be fulfilled by multiple shipments.
 */
export type ShipmentCanceled = (transaction: Transaction, arg2: unknown) => void | Promise<void>;
