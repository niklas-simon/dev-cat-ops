export interface FilterOptions {
    search: string;
    rating: number[];
    sort: string;
}

export const defaultFilter = {
    search: "",
    rating: [1, 10],
    sort: "alpha_asc",
};
