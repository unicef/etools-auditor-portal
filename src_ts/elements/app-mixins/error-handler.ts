import isObject from 'lodash-es/isObject';
import isArray from 'lodash-es/isArray';
import forOwn from 'lodash-es/forOwn';
import each from 'lodash-es/each';

const OverviewProperties = ['agreement', 'end_date', 'partner', 'partner_contacted_at',
  'staff_members', 'start_date', 'total_value', 'type'];

const AttachmentsProperties = ['engagement_attachments', 'report_attachments',
  'additional_supporting_documentation_provided'];

const ReportProperties = ['amount_refunded', 'date_of_comments_by_ip', 'test_subject_areas',
  'date_of_comments_by_unicef', 'date_of_draft_report_to_ip', 'date_of_draft_report_to_unicef',
  'date_of_field_visit', 'findings', 'internal_controls', 'justification_provided_and_accepted',
  'pending_unsupported_amount', 'total_amount_of_ineligible_expenditure', 'total_amount_tested',
  'write_off_required', 'audit_observation', 'audit_opinion', 'audited_expenditure',
  'financial_finding_set', 'financial_findings', 'high_risk', 'ip_response', 'key_internal_weakness',
  'low_risk', 'medium_risk', 'number_of_financial_findings', 'pending_unsupported_amount',
  'percent_of_audited_expenditure', 'recommendation'];

const FollowUpProperties = ['additional_supporting_documentation_provided', 'amount_refunded',
  'justification_provided_and_accepted', 'write_off_required',
  'explanation_for_additional_information', 'action_points'];

  export function refactorErrorObject(errorData) {
    if (!errorData) {
      return {};
    }

    if (!isObject(errorData)) {
      return errorData;
    }

    if (isArray(errorData)) {
      return isObject(errorData[0]) && !!errorData[0]
          ? errorData.map(object => refactorErrorObject(object))
          : errorData[0];
    } else {
      forOwn(errorData, (value, key) => {
        errorData[key] = refactorErrorObject(value);
      });
      return errorData;
    }

  }

  export function whichPageTrows(errorObj) {
    let overviewError, attachmentError, reportError, questionnaireError;

    each(errorObj, (value, key) => {
      if (~OverviewProperties.indexOf(key)) {
        overviewError = 'overview';
      }
      if (~AttachmentsProperties.indexOf(key)) {
        attachmentError = 'attachments';
      }
      if (~ReportProperties.indexOf(key)) {
        reportError = 'report';
      }
      if (key === 'questionnaire') {
        questionnaireError = 'questionnaire';
      }
      if (~FollowUpProperties.indexOf(key)) {
        reportError = 'follow-up';
      }
    });

    return overviewError || attachmentError || questionnaireError || reportError || null;
  }

  export function checkNonField(errorObj) {
    if (!isObject(errorObj)) {
      return null;
    }

    let message = null;
    if (isArray(errorObj)) {
      each(errorObj, value => {
        let recursive = checkNonField(value);
        recursive && !message ? message = recursive : null;
      });
    } else {
      each(errorObj, (value, key) => {
        if (key === 'non_field_errors') {
          message = value;
        } else {
          let recursive = checkNonField(value);
          recursive && !message ? message = recursive : null;
        }
      });
    }
    return message;
  }

