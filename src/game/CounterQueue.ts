import { ACTIVE_SEAT_INDEX } from "../scene/CounterSeat.ts";
import type { SeatCustomer } from "../scene/SeatCustomer.ts";

/**
 * Counter line — active customer is the seat closest to Exit (rightmost for now).
 */
export class CounterQueue {
  constructor(private readonly customers: readonly SeatCustomer[]) {}

  /** Seat index (0=L, 1=C, 2=R) currently being served. */
  getActiveSeatIndex(): number {
    const occupied = this.customers.filter((c) => c.isOccupied);
    if (occupied.length === 0) {
      return ACTIVE_SEAT_INDEX;
    }
    return occupied.reduce(
      (max, c) => (c.seatIndex > max ? c.seatIndex : max),
      0,
    );
  }

  getActiveCustomer(): SeatCustomer | undefined {
    const index = this.getActiveSeatIndex();
    return this.customers.find((c) => c.seatIndex === index);
  }

  getCustomerAt(seatIndex: number): SeatCustomer | undefined {
    return this.customers.find((c) => c.seatIndex === seatIndex);
  }

  isActiveSeat(seatIndex: number): boolean {
    return seatIndex === this.getActiveSeatIndex();
  }

  get queueCustomers(): SeatCustomer[] {
    return this.customers.filter((c) => !c.isActive);
  }

  get allCustomers(): readonly SeatCustomer[] {
    return this.customers;
  }
}
