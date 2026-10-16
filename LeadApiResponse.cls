/**
 * Chuẩn hóa response cho các API tạo Lead (ADO #3219).
 * 201 tạo thành công | 401 sai xác thực | 422 dữ liệu không hợp lệ (kèm lỗi theo trường) | 500 lỗi hệ thống.
 * Format: { "Code": <int>, "Message": "...", "Data": {...} | "Errors": [ { "field": "...", "message": "..." } ] }
 */
public with sharing class LeadApiResponse {
    public static final String MSG_CREATED = 'Tạo Lead thành công';
    public static final String MSG_UNAUTHORIZED = 'Sai thông tin xác thực';
    public static final String MSG_INVALID = 'Dữ liệu không hợp lệ';
    public static final String MSG_SERVER_ERROR = 'Lỗi hệ thống';

    public class FieldError {
        public String field;
        public String message;
        public FieldError(String field, String message) {
            this.field = field;
            this.message = message;
        }
    }

    /** 201: đọc lại Status/CreatedDate sau insert vì automation có thể đổi Status. */
    public static String created(RestResponse res, Id leadId) {
        Lead ld = [SELECT Id, Status, CreatedDate FROM Lead WHERE Id = :leadId LIMIT 1];
        return send(res, 201, createdBody(ld.Id, ld.Status, ld.CreatedDate));
    }

    public static String createdBody(Id leadId, String status, Datetime createdDate) {
        JSONGenerator g = JSON.createGenerator(false);
        g.writeStartObject();
        g.writeNumberField('Code', 201);
        g.writeStringField('Message', MSG_CREATED);
        g.writeFieldName('Data');
        g.writeStartObject();
        writeNullable(g, 'leadId', leadId == null ? null : String.valueOf(leadId));
        writeNullable(g, 'status', status);
        writeNullable(g, 'createdDate', createdDate == null ? null : createdDate.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''));
        g.writeEndObject();
        g.writeEndObject();
        return g.getAsString();
    }

    /** 422 từ lỗi DML: mỗi trường bị lỗi là một phần tử; lỗi không gắn trường thì field = null. */
    public static String invalid(RestResponse res, List<Database.Error> dbErrors) {
        List<FieldError> errors = new List<FieldError>();
        if (dbErrors != null) {
            for (Database.Error err : dbErrors) {
                List<String> fields = err.getFields();
                if (fields == null || fields.isEmpty()) {
                    errors.add(new FieldError(null, err.getMessage()));
                } else {
                    for (String f : fields) {
                        errors.add(new FieldError(f, err.getMessage()));
                    }
                }
            }
        }
        return invalid(res, errors);
    }

    public static String invalid(RestResponse res, List<FieldError> errors) {
        JSONGenerator g = JSON.createGenerator(false);
        g.writeStartObject();
        g.writeNumberField('Code', 422);
        g.writeStringField('Message', MSG_INVALID);
        g.writeFieldName('Errors');
        g.writeStartArray();
        if (errors != null) {
            for (FieldError e : errors) {
                g.writeStartObject();
                writeNullable(g, 'field', e.field);
                writeNullable(g, 'message', e.message);
                g.writeEndObject();
            }
        }
        g.writeEndArray();
        g.writeEndObject();
        return send(res, 422, g.getAsString());
    }

    public static String unauthorized(RestResponse res) {
        return send(res, 401, simpleBody(401, MSG_UNAUTHORIZED));
    }

    /** 500: không trả stack trace ra ngoài, chi tiết lỗi ghi ở DevLog. */
    public static String serverError(RestResponse res) {
        return send(res, 500, simpleBody(500, MSG_SERVER_ERROR));
    }

    private static String simpleBody(Integer code, String message) {
        JSONGenerator g = JSON.createGenerator(false);
        g.writeStartObject();
        g.writeNumberField('Code', code);
        g.writeStringField('Message', message);
        g.writeEndObject();
        return g.getAsString();
    }

    private static void writeNullable(JSONGenerator g, String name, String value) {
        if (value == null) {
            g.writeNullField(name);
        } else {
            g.writeStringField(name, value);
        }
    }

    private static String send(RestResponse res, Integer code, String body) {
        if (res != null) {
            res.statusCode = code;
            res.responseBody = Blob.valueOf(body);
        }
        return body;
    }
}