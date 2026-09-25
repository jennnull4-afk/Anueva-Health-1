"use client";

type CheckoutAddress = { id: string; fullName: string; company?: string; address1: string; address2?: string; city: string; state: string; postalCode: string; country: string; phone?: string };

export function SavedAddressPicker({ addresses }: { addresses: CheckoutAddress[] }) {
  if (!addresses.length) return null;
  function apply(id: string) {
    const address = addresses.find((entry) => entry.id === id);
    const form = document.getElementById("checkout-form");
    if (!address || !(form instanceof HTMLFormElement)) return;
    const values: Record<string, string> = { shippingName: address.fullName, address1: address.address1, address2: address.address2 ?? "", city: address.city, state: address.state, postalCode: address.postalCode, country: address.country, phone: address.phone ?? "" };
    for (const [name, value] of Object.entries(values)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) field.value = value;
    }
  }
  return <section className="account-card"><h2 className="font-serif text-2xl">Saved addresses</h2><label className="mt-4 block text-sm font-semibold">Use a saved address<select className="form-input" defaultValue="" onChange={(event) => apply(event.target.value)}><option value="">Enter a new address</option>{addresses.map((address) => <option key={address.id} value={address.id}>{address.fullName}, {address.address1}, {address.city}</option>)}</select></label><p className="mt-2 text-xs text-slate-500">Guest checkout remains available. Selecting an address fills the shipping fields without changing stored order history.</p></section>;
}
