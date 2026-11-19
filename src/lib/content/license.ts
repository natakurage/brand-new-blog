export const ccLicenses = {
  "CC BY 4.0": { deedUrl: "https://creativecommons.org/licenses/by/4.0/", logoUrl: "https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by.svg" },
  "CC BY-NC 4.0": { deedUrl: "https://creativecommons.org/licenses/by-nc/4.0/", logoUrl: "https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc.svg" },
  "CC BY-NC-ND 4.0": { deedUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/", logoUrl: "https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-nd.svg" },
  "CC BY-NC-SA 4.0": { deedUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/", logoUrl: "https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-sa.svg" },
  "CC BY-ND 4.0": { deedUrl: "https://creativecommons.org/licenses/by-nd/4.0/", logoUrl: "https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nd.svg" },
  "CC BY-SA 4.0": { deedUrl: "https://creativecommons.org/licenses/by-sa/4.0/", logoUrl: "https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg" },
  "CC0 1.0": { deedUrl: "https://creativecommons.org/publicdomain/zero/1.0/", logoUrl: "https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/cc-zero.svg" }
};

export type CcLicenseId = keyof typeof ccLicenses;

export type License =
  | { kind: "cc"; id: CcLicenseId }
  | { kind: "custom"; text: string }
  | { kind: "unspecified" };

export const licenseLabel = (license: License): string => {
  switch (license.kind) {
    case "cc":
      return license.id;
    case "custom":
      return license.text;
    case "unspecified":
      return "不明なライセンス";
  }
}

export const licenseUrl = (license: License) => {
  switch (license.kind) {
    case "cc":
      return ccLicenses[license.id].deedUrl;
    case "custom":
      return license.text;
    case "unspecified":
      return undefined;
    default:
      return license satisfies never;
  }
}