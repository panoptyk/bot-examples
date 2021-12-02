// Used to help create more JS friendly enums
export type EnumLiteralsOf<T extends object> = T[keyof T];
