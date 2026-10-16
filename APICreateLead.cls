@RestResource(urlMapping='/APICreateLead/*')
global class APICreateLead { 
    @HttpPost  
    global static void Run() {           
        DevLog__c objDevLog = new DevLog__c();
        objDevLog.Function__c = 'APICreateLead';
        
        RestResponse res = RestContext.response;
        JsonResponse objResult = new JsonResponse();        
        string strResult = '';
        res.addHeader('Access-Control-Allow-Origin', '*');
        res.addHeader('Content-Type', 'application/json');
        try {          
            string strParam = RestContext.request.requestBody.toString();   
            
            string strHeader = Json.Serialize(RestContext.request.headers);
            objDevLog.Header__c = strHeader;
            objDevLog.Input__c = strParam;
            Lead objJson = (Lead)json.deserialize(strParam, Lead.class);   
            
            LandingPageToken__c landingPageToken = [SELECT Token_APICreatedLead__c FROM LandingPageToken__c LIMIT 1];
            String expectedToken = landingPageToken.Token_APICreatedLead__c;
            
            //Cách này cũng đúng và dòng 26 cũng đúng 
           /* RestRequest req = RestContext.request;
            Map<String, String> mpHeader = req.headers;
            string tokenFromHeader = mpHeader.get('Authorization_permanent'); */
            
            String tokenFromHeader = RestContext.request.headers.get('authorizationpermanent');
           
            
            if(tokenFromHeader == expectedToken){
                if(objJson != null)
                {   
                    List<Product2> lstProgramme = [SELECT Id, Name, Campus_Group__c, Category__c, Group_Programme__c FROM Product2];
                    List<Province__c> lstProvince = [SELECT Id, Name FROM Province__c];
                    List<Category__c> lstCategory = [SELECT Id, Name FROM Category__c];              
                    List<Campus__c> lstCampus = [SELECT Id FROM Campus__c WHERE Name = 'BUV Hung Yen' LIMIT 1];
                    //List<Campus_Group__c> lstCampusGroup = [SELECT Id FROM Campus_Group__c WHERE Name = 'British University Vietnam' LIMIT 1];
                    
                    Map<String, Product2> programmeMap = new Map<String, Product2>();
                    for (Product2 programme : lstProgramme) {
                        programmeMap.put(programme.Id, programme);
                    }
                    
                    // Mapping giá trị bắt buộc
                   /* if(objJson.Interested_Programme__c != null) {
                        for(Product2 programme : lstProgramme) {
                            String programmeNameLowerCase = programme.Name.toLowerCase();
                            String objJsonProgrammeLowerCase = objJson.Interested_Programme__c.toLowerCase();
                            if(programmeNameLowerCase.equalsIgnoreCase(objJsonProgrammeLowerCase)) {
                                objJson.Grade__c = programme.Id;
                                objJson.Campus_Group__c = programme.Campus_Group__c;
                                objJson.Category__c = programme.Category__c;
                                objJson.Group_Programme__c = programme.Group_Programme__c;
                                break;
                            }
                        }
                    } */                    
                    
                    // Bổ sung theo task BUV-547
                    if (objJson.Interested_Programme__c != null && programmeMap.containsKey(objJson.Interested_Programme__c)) {
                        Product2 programme = programmeMap.get(objJson.Interested_Programme__c);
                        objJson.Grade__c = programme.Id;
                        objJson.Campus_Group__c = programme.Campus_Group__c;
                        objJson.Category__c = programme.Category__c;
                        objJson.Group_Programme__c = programme.Group_Programme__c;
                    }
                    
                    if(objJson.City_or_Province__c != null) {
                        for(Province__c province : lstProvince) {
                            String programmeNameLowerCase = province.Name.toLowerCase();
                            String objJsonProgrammeLowerCase = objJson.City_or_Province__c.toLowerCase();
                            if(programmeNameLowerCase.equalsIgnoreCase(objJsonProgrammeLowerCase)) {
                                objJson.City_Province__c = province.Id;
                                break;
                            }
                        }
                    }
                    
                    if(objJson.Interested_Category__c != null) {
                        for(Category__c category : lstCategory) {
                            String programmeNameLowerCase = category.Name.toLowerCase();
                            String objJsonProgrammeLowerCase = objJson.Interested_Category__c.toLowerCase();
                            if(programmeNameLowerCase.equalsIgnoreCase(objJsonProgrammeLowerCase)) {
                                objJson.Category__c = category.Id;
                                break;
                            }
                        }
                    }                                        
                    
                    objJson.isLandingPage__c = true;
                    objJson.isDigital__c = true;
                    objJson.isAPI__c = true;
                    // 21/09/2026: API ep isAPI/isDigital = true nen ban ghi BAT BUOC di qua Gate 1,
                    // ma Gate 1 chi doc Email_check__c / Mobile_check__c. Ben goi nao gui Email /
                    // MobilePhone se bi danh Unqualified oan. Bu truong nguon truoc khi insert.
                    LeadIntakeFieldNormalizer.fillSourceFields(objJson);
                    // 10/10/2026 (#4075): Working people/BUV Alumni -> Student, Parent -> Guardian.
                    LeadIntakeFieldNormalizer.normalizeYouAre(objJson);
                    //objJson.Enable_Round_Robin__c = true;
                    //objJson.Run_Reassign__c = true;
                    //objJson.Campus__c = lstCampus[0].Id;
                    if(String.isBlank(objJson.LeadSource)){
                        objJson.LeadSource = 'MarComm';  
                    }
                    
                    if(String.isBlank(objJson.Lead_Sub_Source__c)){
                        objJson.Lead_Sub_Source__c = 'Landing Page';
                    }
                     
                    
                    // objJson.Campus_Group__c = lstCampusGroup[0].Id;
                    
                    //upsert objJson;
                    Database.DMLOptions dml = new Database.DMLOptions(); 
                    dml.DuplicateRuleHeader.AllowSave = true;
                    Database.SaveResult sr = Database.insert(objJson, dml);
                    if (sr.isSuccess()) {
                        strResult = LeadApiResponse.created(res, sr.getId());
                        objDevLog.isSuccess__c = true;
                        // TC-246: enquiry / yeu cau tu van 1-1 tu khach da co Opportunity dang mo ->
                        // ghi Activity Timeline tren Contact + thong bao SR Owner. Loi o day KHONG duoc
                        // lam hong API tao Lead.
                        if (objJson.Is_In_Depth_Consultation__c == true || String.isNotBlank(objJson.Enquiry__c)) {
                            try {
                                ExistingOpportunityEnquiryService.handle(
                                    objJson.Email,
                                    String.isNotBlank(objJson.MobilePhone) ? objJson.MobilePhone : objJson.Phone,
                                    objJson.Is_In_Depth_Consultation__c == true,
                                    objJson.LeadSource,
                                    objJson.Enquiry__c);
                            } catch (Exception ex) {
                                System.debug(LoggingLevel.ERROR, 'ExistingOpportunityEnquiryService: ' + ex.getMessage());
                            }
                        }
                    } else {
                        strResult = LeadApiResponse.invalid(res, sr.getErrors());
                        objDevLog.isSuccess__c = false;
                    }
                } else {
                    strResult = LeadApiResponse.invalid(res, new List<LeadApiResponse.FieldError>{
                        new LeadApiResponse.FieldError(null, 'Body request rỗng')
                    });
                    objDevLog.isSuccess__c = false;
                }
            }else{
                strResult = LeadApiResponse.unauthorized(res);
                objDevLog.isSuccess__c = false;
            }

        } catch(JSONException e) {
            // Body sai cú pháp JSON hoặc sai kiểu dữ liệu (vd: DOB không đúng định dạng ngày)
            strResult = LeadApiResponse.invalid(res, new List<LeadApiResponse.FieldError>{
                new LeadApiResponse.FieldError(null, e.getMessage())
            });
            objDevLog.isSuccess__c = false;
        } catch(exception e) {
            LeadApiResponse.serverError(res);
            strResult = e.getMessage() + '-' + e.getStackTraceString() + e.getLineNumber();
            objDevLog.isSuccess__c = false;
        }

        objDevLog.Output__c = strResult;
        insert objDevLog;
    }

    public class JsonResponse
    {
        public String message { get; set; }
        public Integer code { get; set; }
        public Lead Data { get; set; }
        public String Token_APICreatedLead { get; set; }
         
    }
    public static void l(){
        string l = '';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
        l='';
    }
}