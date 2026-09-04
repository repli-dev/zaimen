import { getSession } from "./auth";
import { getCouple } from "./store";
import type { Couple, Partner } from "./types";

export async function requireCoupleUser() {
  const session = await getSession();
  if (!session) return null;
  const couple = await getCouple();
  if (!couple) return null;
  const me = couple.partners.find((partner) => partner.id === session.partnerId);
  const partner = couple.partners.find(
    (person) => person.id !== session.partnerId,
  );
  if (!me || !partner) return null;
  return { me, partner, couple } satisfies {
    me: Partner;
    partner: Partner;
    couple: Couple;
  };
}
