declare interface Api {
  definitions: GoogleApi & RandomDataApi;
}

const main = async () => {
  const r1 = await fetch("http://www.google.com", {
    method: "GET",
    //       ^ This is defined as optional, but can't is typed as strictly GET
  });

  const v1 = await r1.text();
  console.log(v1);

  const r2 = await fetch("https://random-data-api.com/api/v2/addresses");

  const v2 = await r2.json();
  //    ^ type RandomAddress
  console.log(v2);

  const r3 = await fetch("https://random-data-api.com/api/v2/users");

  const v3 = await r3.json();
  //    ^ type RandomUser
  console.log(v3);
};

main();

type GoogleApi = ApiDefinition<{
  "http://www.google.com": {
    response: Response;
    init?: RequestInit & { method?: "GET" };
  };
}>;

type RandomDataApi = ApiDefinition<{
  "https://random-data-api.com/api/v2/users": {
    response: Omit<Response, "json"> & { json: () => Promise<RandomUser> };
    init?: RequestInit & {
      method?: "GET";
    };
  };

  "https://random-data-api.com/api/v2/addresses": {
    response: Omit<Response, "json"> & { json: () => Promise<RandomAddress> };
    init?: RequestInit & {
      method?: "GET";
    };
  };
}>;

type RandomUser = {
  id: number;
  uid: string;
  password: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  avatar: string;
  gender: string;
  phone_number: string;
  social_insurance_number: string;
  date_of_birth: Date;
  employment: Employment;
  address: Address;
  credit_card: CreditCard;
  subscription: Subscription;
};

type Address = {
  city: string;
  street_name: string;
  street_address: string;
  zip_code: string;
  state: string;
  country: string;
  coordinates: Coordinates;
};

type Coordinates = {
  lat: number;
  lng: number;
};

type CreditCard = {
  cc_number: string;
};

type Employment = {
  title: string;
  key_skill: string;
};

type Subscription = {
  plan: string;
  status: string;
  payment_method: string;
  term: string;
};

type RandomAddress = {
  id: number;
  uid: string;
  city: string;
  street_name: string;
  street_address: string;
  secondary_address: string;
  building_number: string;
  mail_box: string;
  community: string;
  zip_code: string;
  zip: string;
  postcode: string;
  time_zone: string;
  street_suffix: string;
  city_suffix: string;
  city_prefix: string;
  state: string;
  state_abbr: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  full_address: string;
};
