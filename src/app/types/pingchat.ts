export interface getUserContacts {
    search?: any;
    msisdn: string;
    page: number;
}
export interface getGroupContacts {
    from: string;
    groupId: string;
    page: number;
    search?: string;
}