export interface UnitAgreement {
    Id: number;
    Type: string;
    Href: string;
}

export interface PaymentDetail {
    PaymentMethod: string;
    Payee: any;
    IsInternalTransaction: boolean;
    InternalTransactionStatus: any;
}

export interface DepositDetails {
    BankGLAccountId: any;
    PaymentTransactions: any[];
}

export interface GLAccount {
    Id: number;
    AccountNumber: string;
    Name: string;
    Description: string;
    Type: string;
    SubType: string;
    IsDefaultGLAccount: boolean;
    DefaultAccountName: string;
    IsContraAccount: boolean;
    IsBankAccount: boolean;
    CashFlowClassification: string;
    ExcludeFromCashBalances: boolean;
    SubAccounts: any;
    IsActive: boolean;
    ParentGLAccountId: any;
}

export interface AccountingEntity {
    Id: number;
    AccountingEntityType: string;
    Href: string;
}

export interface JournalLine {
    GLAccount: GLAccount;
    Amount: number;
    IsCashPosting: boolean;
    ReferenceNumber: string;
    Memo: string;
    AccountingEntity: AccountingEntity;
}

export interface Journal {
    Memo: string;
    Lines: JournalLine[];
}

export interface Transaction {
    Id: number;
    Date: string;
    TransactionType: string;
    TotalAmount: number;
    CheckNumber: string;
    UnitAgreement: UnitAgreement;
    UnitId: number;
    UnitNumber: string;
    PaymentDetail: PaymentDetail;
    DepositDetails: DepositDetails;
    Journal: Journal;
}
