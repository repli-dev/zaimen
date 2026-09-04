export type Partner = {
  id: string;
  name: string;
};

export type WishItem = {
  id: string;
  ownerId: string;
  name: string;
  url: string;
  notes: string;
  boughtBySelf: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Couple = {
  passwordHash: string;
  salt: string;
  partners: [Partner, Partner];
};

export type AppStore = {
  couple: Couple | null;
  items: WishItem[];
};

export type Session = {
  partnerId: string;
};

export type Me = {
  me: Partner;
  partner: Partner;
};
