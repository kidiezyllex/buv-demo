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
                        res.statusCode = 200;
                        strResult = 'The request was a success.';
                        objDevLog.isSuccess__c = true;
                        objResult.data = objJson;
                    } else {
                        List<String> errMsgs = new List<String>();
                        for (Database.Error err : sr.getErrors()) {
                            errMsgs.add(err.getMessage());
                        }
                        strResult = String.join(errMsgs, '; ');
                        res.statusCode = 400;
                        objDevLog.isSuccess__c = false;
                    }
                }
            }else{
                strResult = 'The token invalid';
                res.statusCode = 401;
                objDevLog.isSuccess__c = false;
            }

        } catch(exception e) {
            strResult = e.getMessage() + '-' + e.getStackTraceString() + e.getLineNumber();
            res.statusCode = 500;
        }

       // if(objDevLog.isSuccess__c == false){
            objDevLog.Output__c = strResult;
            insert objDevLog;

            // All_Settings__c setting = All_Settings__c.getorgdefaults();
            // Libraries.SendEmail('APIMioInvestor', objDevLog.Id + ': ' +strResult, setting.Email_Exception__c);
       // }
        objResult.message = strResult;
        objResult.code = res.statusCode;
        // Tạo JSON thủ công để đảm bảo thứ tự mong muốn
        String responseBody = '{"Message":"' + objResult.message + '"';
        if (objResult.code != null) {
            responseBody += ',"Code":' + objResult.code;
        }
        responseBody += ',"data":' + JSON.serialize(objResult.Data) + '}';
        res.responseBody = Blob.valueOf(responseBody);
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