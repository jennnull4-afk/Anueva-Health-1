"use server";

import { redirect } from "next/navigation";
import { clientIdentifier, consumeRateLimit } from "@/lib/request-security";
import { changePassword, confirmEmailChange, createSupportRequest, deleteAddress, endCustomerSession, registerCustomer, requestAccountDeletion, requestEmailChange, requestPasswordReset, resetPassword, saveAddress, signInCustomer, updateProfile, verifyEmail } from "@/lib/customers";

export type AccountState = { error?: string; message?: string };
async function limited(action: string, limit = 8) {
  if (!consumeRateLimit(`${action}:${await clientIdentifier()}`, limit, 15 * 60_000)) throw new Error("Too many attempts. Please wait and try again.");
}
export async function registerAction(_state: AccountState, formData: FormData): Promise<AccountState> {
  try { await limited("register", 5); await registerCustomer({ firstName: String(formData.get("firstName") ?? ""), lastName: String(formData.get("lastName") ?? ""), email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") }); return { message: "If this email can be registered, a verification message has been sent." }; }
  catch (error) { return { error: error instanceof Error ? error.message : "Unable to create the account." }; }
}
export async function signInAction(_state: AccountState, formData: FormData): Promise<AccountState> {
  try { await limited("sign-in"); await signInCustomer(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""), formData.get("remember") === "on"); }
  catch (error) { return { error: error instanceof Error ? error.message : "Unable to sign in." }; }
  redirect("/account");
}
export async function signOutAction() { await endCustomerSession(); redirect("/account/sign-in"); }
export async function forgotPasswordAction(_state: AccountState, formData: FormData): Promise<AccountState> {
  try { await limited("reset", 5); await requestPasswordReset(String(formData.get("email") ?? "")); } catch { /* Keep the response identical whether or not delivery succeeds. */ }
  return { message: "If an account exists for that email, password reset instructions have been sent." };
}
export async function resetPasswordAction(_state: AccountState, formData: FormData): Promise<AccountState> {
  try { await limited("reset-complete"); await resetPassword(String(formData.get("token") ?? ""), String(formData.get("password") ?? "")); return { message: "Your password has been reset. You can now sign in." }; }
  catch (error) { return { error: error instanceof Error ? error.message : "Unable to reset the password." }; }
}
export async function confirmVerificationAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const purpose = String(formData.get("purpose") ?? "");
  const verified = purpose === "change-email" ? await confirmEmailChange(token) : await verifyEmail(token);
  redirect(verified ? "/account/sign-in?verified=1" : "/account/verify-email?error=1");
}
export async function profileAction(_state: AccountState, formData: FormData): Promise<AccountState> {
  try { await updateProfile({ firstName: String(formData.get("firstName") ?? ""), lastName: String(formData.get("lastName") ?? ""), phone: String(formData.get("phone") ?? ""), orderUpdates: formData.get("orderUpdates") === "on", catalogUpdates: formData.get("catalogUpdates") === "on" }); return { message: "Personal information updated." }; }
  catch (error) { return { error: error instanceof Error ? error.message : "Unable to update your profile." }; }
}
export async function emailChangeAction(_state: AccountState, formData: FormData): Promise<AccountState> {
  try { await limited("email-change", 5); await requestEmailChange(String(formData.get("email") ?? ""), String(formData.get("currentPassword") ?? "")); return { message: "If the email can be used, a confirmation message has been sent. Your current email remains active until confirmed." }; }
  catch (error) { return { error: error instanceof Error ? error.message : "Unable to update the email." }; }
}
export async function passwordAction(_state: AccountState, formData: FormData): Promise<AccountState> {
  try { await limited("password", 5); await changePassword(String(formData.get("currentPassword") ?? ""), String(formData.get("password") ?? "")); }
  catch (error) { return { error: error instanceof Error ? error.message : "Unable to change the password." }; }
  redirect("/account/sign-in");
}
export async function addressAction(_state: AccountState, formData: FormData): Promise<AccountState> {
  try { await saveAddress(formData); return { message: "Address book updated." }; }
  catch (error) { return { error: error instanceof Error ? error.message : "Unable to save the address." }; }
}
export async function deleteAddressAction(formData: FormData) { await deleteAddress(String(formData.get("addressId") ?? "")); }
export async function supportAction(_state: AccountState, formData: FormData): Promise<AccountState> {
  try { const request = await createSupportRequest({ orderId: String(formData.get("orderId") ?? "") || undefined, subject: String(formData.get("subject") ?? ""), message: String(formData.get("message") ?? "") }); return { message: `Support request ${request.id} was submitted.` }; }
  catch (error) { return { error: error instanceof Error ? error.message : "Unable to submit the request." }; }
}
export async function deletionAction(_state: AccountState, formData: FormData): Promise<AccountState> {
  try { await requestAccountDeletion(String(formData.get("password") ?? "")); }
  catch (error) { return { error: error instanceof Error ? error.message : "Unable to request deletion." }; }
  redirect("/account/sign-in?deleted=1");
}
