export type VerificationResult = {
    valid: boolean;
    itemsChanged: Record<string, number>;
    availableItems: Record<string, string>;
}