import { ACTIVE_SEAT_INDEX } from "../scene/CounterSeat.ts";
import type { SeatCustomer } from "../scene/SeatCustomer.ts";

/**
 * Counter line — three seat slots; active customer sits at Exit (seat R).
 */
export class CounterQueue {
  private readonly slots: Array<SeatCustomer | null>;

  constructor(customers: readonly SeatCustomer[]) {
    this.slots = [null, null, null];
    for (const customer of customers) {
      this.slots[customer.seatIndex] = customer;
    }
  }

  getActiveSeatIndex(): number {
    return ACTIVE_SEAT_INDEX;
  }

  getActiveCustomer(): SeatCustomer | undefined {
    const atExit = this.slots[ACTIVE_SEAT_INDEX];
    return atExit?.isActive ? atExit : undefined;
  }

  getCustomerAt(seatIndex: number): SeatCustomer | undefined {
    return this.slots[seatIndex] ?? undefined;
  }

  setCustomerAt(seatIndex: number, customer: SeatCustomer | null): void {
    this.slots[seatIndex] = customer;
  }

  clearSeat(seatIndex: number): void {
    this.slots[seatIndex] = null;
  }

  isActiveSeat(seatIndex: number): boolean {
    return seatIndex === ACTIVE_SEAT_INDEX;
  }

  get queueCustomers(): SeatCustomer[] {
    return this.slots.filter(
      (c): c is SeatCustomer => c !== null && !c.isActive,
    );
  }

  get allCustomers(): SeatCustomer[] {
    return this.slots.filter((c): c is SeatCustomer => c !== null);
  }
}
