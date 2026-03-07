export interface AgreementClientData {
    clientName: string;
    propertyAddress: string;
    mailingAddress: string;
    county: string;
    date: string;
}

const COMPANY_NAME = 'Citus Recovery Solutions LLC';

export const getServiceAgreementSections = (data: AgreementClientData) => {
    const clientName = data.clientName || '[________________]';
    const propertyDesc = data.propertyAddress && data.county
        ? `${data.propertyAddress}, ${data.county} County, FL`
        : '____________';
    const agreementDate = data.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return [
        {
            heading: 'Services Agreement',
            body: `Date: ${agreementDate}`,
        },
        {
            heading: 'Parties',
            body: `This Services Agreement ("Agreement") is entered into by and between ${COMPANY_NAME} (hereinafter referred to as "Company") and ${clientName} (hereinafter referred to as "Client").`,
        },
        {
            heading: 'Purpose',
            body: `The Company is engaged in the business of processing claims for funds it has located, and the Client wishes for the Company to verify eligibility and recover said funds on behalf of the Client. The Company shall also provide services related to the recovery of proceeds from trustee sales and any other unclaimed funds potentially belonging to ${clientName}, including but not limited to property at ${propertyDesc}.`,
        },
        {
            heading: 'Conditions of Agreement',
            body: 'This Agreement will not take effect, and the Company will have no obligation to provide services until the Client returns a signed copy of this Agreement.',
        },
        {
            heading: 'Scope of Services',
            body: null,
            bullets: [
                'Identification of Claim: The Company will perform the necessary research to identify the source and amount of the Client\'s claim.',
                'Recovery and Expenses: The Company shall be responsible for all expenses and dedicate the labor required to recover the Client\'s claim, including paying all legal expenses, whether or not the claim is recovered.',
                'Exclusive Agent: The Company is authorized to act as the Client\'s exclusive agent for the recovery of the claim, including proceeds from trustee sales.',
                'Performance of Services: The Company and its attorney will determine the manner in which services are performed and the specific hours to be worked.',
                'Use of Services: The Client agrees to use the Company\'s services as an independent contractor for any claims associated with trustee sales.',
            ],
        },
        {
            heading: 'Compensation',
            body: null,
            bullets: [
                'Contingent Fee: This Agreement is contingent upon the Client actually receiving funds. If no funds are recovered, except in cases of breach by the Client, neither party has any further obligations.',
                'Costs: The Company shall bear all costs associated with the recovery of the claim, whether recovered or not.',
                'Success Fee: Upon successful recovery, the Company shall retain the agreed-upon percentage of the claim as a fee. The party receiving the check shall send the other party their portion within five (5) business days of receiving the check and funds clearing their bank.',
            ],
        },
        {
            heading: 'Client\'s Responsibilities',
            body: null,
            bullets: [
                'Authorization: The Client authorizes the Company to act as their exclusive agent for the recovery of the claim.',
                'Paperwork: The Client agrees to sign and return all documents required for recovery promptly.',
                'Cooperation: The Client agrees to cooperate with any local attorney and fulfill all reasonable requests from the Company.',
                'Truthfulness: The Client agrees to provide truthful and complete information to the Company and its representatives.',
            ],
        },
        {
            heading: 'Non-Circumvention',
            body: 'The Client agrees not to circumvent the Company by independently claiming funds identified by the Company or engaging another party for recovery. Any breach shall result in liability for damages and reimbursement of costs incurred by the Company.',
        },
        {
            heading: 'Limitation of Liability',
            body: 'The Company\'s liability shall not exceed the amount paid by the Client for fees or costs. The Client agrees to indemnify and hold the Company harmless from claims arising from services performed under this Agreement.',
        },
        {
            heading: 'Local Attorney',
            body: 'If the use of an attorney is required, the attorney will be responsible for distributing the surplus funds collected. Attorney cost can be included in the surplus agreement for claims in which the Company\'s recovery fee is above the threshold of $5,000; anything below that, the attorney fees will be separate from the Company\'s success fee but will be contingent.',
        },
        {
            heading: 'Termination',
            body: 'This Agreement may be terminated in writing within seven (7) days of execution. If termination notice is not received within this period, the Agreement remains effective until services are completed.',
        },
        {
            heading: 'Arbitration',
            body: 'Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. Each party shall bear its own costs, and the prevailing party shall be entitled to reasonable attorney\'s fees.',
        },
        {
            heading: 'Miscellaneous Provisions',
            body: null,
            bullets: [
                'Governing Law: This Agreement shall be governed by the laws of the State of Florida.',
                'Entire Agreement: This document represents the entire agreement between the parties.',
                'Severability: If any provision is held unenforceable, the remainder shall continue in full force and effect.',
                'Effective Date: This Agreement is effective upon execution by both parties.',
            ],
        },
    ];
};
