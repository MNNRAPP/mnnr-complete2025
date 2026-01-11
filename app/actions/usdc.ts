"use server";

export async function checkoutWithUSDC() {
  return {
    success: false,
    error: "USDC checkout is not yet enabled. Please use Stripe for now."
  };
}
