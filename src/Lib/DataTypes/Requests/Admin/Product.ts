// Define the request data type
export interface ProductRequestDataType {
    image?: string;
    productName: string;
    type: string;
    spvBrand?: string;
    spvType?: string;
    phase?: string;
    capacity?: number;
    spvCapacity?: number;
    price: number;
    service?: string;
    thickness?: number;
}
