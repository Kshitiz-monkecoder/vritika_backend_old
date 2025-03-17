import { CustomerModelDataType } from "../Models/Customer"
import { QuotationModelType } from "../Models/Quotation"
import { SalesPersonModelDataType } from "../Models/SalesPerson"
import { SiteSurveyModelDataType } from "../Models/SiteSurvey"


export type SiteSurveyDataType = SiteSurveyModelDataType & {
    customer: CustomerModelDataType,
    salesPerson: SalesPersonModelDataType
    quotations: QuotationModelType
}