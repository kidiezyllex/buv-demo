/**
 * Chuan hoa truong lien lac cua Lead truoc khi Insert - 21/09/2026.
 *
 * QUY UOC CUA HE THONG: moi luong tao Lead phai do du lieu lien lac vao CAP TRUONG NGUON
 * Email_check__c / Mobile_check__c. Gate 1 (TriggerLeadHandler.checkErrorDataTypeLead) kiem dinh
 * dang tren 2 truong nguon nay roi moi chep sang Email / MobilePhone. Cac Validation Rule chan
 * "thieu Email/Mobile" cung doc 2 truong nguon.
 *
 * VI SAO CAN CLASS NAY: 5 REST API tao Lead (APICreateLead, APILeadEnglish, APILeadPathway,
 * APILeadPostgraduate, APILeadUndergraduate) deu deserialize thang payload vao Lead roi EP
 * isAPI__c = isDigital__c = true - tuc la bat buoc di qua Gate 1 - nhung KHONG he dam bao 2 truong
 * nguon co gia tri. Ben goi nao gui 'Email'/'MobilePhone' thay vi 'Email_check__c'/'Mobile_check__c'
 * se roi vao nhanh "ca hai deu null" cua Gate 1 va bi danh Unqualified /
 * Unqualified_Reason__c = 'Missing Mandatory Fields' NGAY LUC TAO - du du lieu lien lac hoan toan
 * hop le.
 *
 * Do la loi that va dang xay ra: tren UAT2_BUV co 56 Lead bi gan co thieu truong bat buoc trong khi
 * Email VA MobilePhone deu co gia tri, con Email_check__c/Mobile_check__c thi trong. Doi chieu:
 * 49 Lead co Email_check__c duoc dien - tuc dang co HAI nhom ben goi theo hai hop dong khac nhau.
 *
 * CACH SUA O DAY (bu vao, khong ghi de): chi dien truong nguon khi no dang TRONG. Ben goi da gui
 * dung Email_check__c thi giu nguyen gia tri ho gui - ke ca khi no sai dinh dang, vi viec bat loi
 * dinh dang la viec cua Gate 1, khong phai cua class nay.
 *
 * KHONG dat logic nay vao TriggerLeadHandler: (1) thu tu chay giua nhieu trigger cung object khong
 * duoc Salesforce bao dam, dat o day thi chac chan chay TRUOC insert nen Gate 1 luon thay du lieu;
 * (2) TriggerLeadHandler dai 3.884 dong va dang 0% coverage, sua vao la khong deploy duoc.
 */
public with sharing class LeadIntakeFieldNormalizer {

    /** Dung cho luong tao 1 Lead (cac REST API deserialize 1 ban ghi). */
    public static void fillSourceFields(Lead record) {
        if (record == null) { return; }
        if (String.isBlank(record.Email_check__c) && String.isNotBlank(record.Email)) {
            record.Email_check__c = record.Email;
        }
        if (String.isBlank(record.Mobile_check__c) && String.isNotBlank(record.MobilePhone)) {
            record.Mobile_check__c = record.MobilePhone;
        }
    }

    /** Dung cho luong tao hang loat. */
    public static void fillSourceFields(List<Lead> records) {
        if (records == null) { return; }
        for (Lead record : records) {
            fillSourceFields(record);
        }
    }

    /**
     * 10/10/2026: sau #4075 (Unused Values for You Are Picklist) RecordType Student/Guardian cua Lead
     * chi con cho phep You_are__c = 'Student' / 'Guardian'. Ben goi API (form website, landing page)
     * van gui 'Working people' / 'BUV Alumni' / 'Parent' -> insert bi tu choi
     * "bad value for restricted picklist field" (422). Quy uoc BUV (Giang Pham):
     *   Guardian: Guardian, Parent
     *   Student : Student, Working people, BUV Alumni
     * So khop khong phan biet hoa/thuong. Gia tri ngoai danh sach giu nguyen de restricted picklist
     * van chan va tra loi ro rang cho ben goi. Record Type do flow Lead_Auto_Assign_RecordType gan
     * theo You_are__c sau khi da chuan hoa.
     */
    private static final Map<String, String> YOU_ARE_MAPPING = new Map<String, String>{
        'student' => 'Student',
        'working people' => 'Student',
        'buv alumni' => 'Student',
        'guardian' => 'Guardian',
        'parent' => 'Guardian'
    };

    public static void normalizeYouAre(Lead record) {
        if (record == null || String.isBlank(record.You_are__c)) { return; }
        String mapped = YOU_ARE_MAPPING.get(record.You_are__c.trim().toLowerCase());
        if (mapped != null) {
            record.You_are__c = mapped;
        }
    }
}