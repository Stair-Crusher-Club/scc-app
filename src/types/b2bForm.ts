import type {
  ChallengeB2bFormAvailableFieldDto,
  ChallengeB2bFormAvailableFieldNameTypeDto,
  JoinChallengeRequestCompanyJoinInfoDto,
  ChallengeB2bCustomFormResponseItemDto,
} from '@/generated-sources/openapi';

/**
 * Unified form field type for both built-in and custom fields
 *
 * @property key - Stable identifier for the field
 *                 Built-in: uses the enum value (e.g., 'participantName')
 *                 Custom: uses array index as fallback until server provides key
 * @property name - Enum value for built-in fields, null for custom fields
 * @property displayName - User-friendly label to display in UI
 * @property options - null for text input, array of strings for select input
 */
export interface FormField {
  key: string;
  name: ChallengeB2bFormAvailableFieldNameTypeDto | null;
  displayName: string;
  options: string[] | null;
}

/**
 * Form state - simple Record with field keys
 */
export type FormState = Record<string, string>;

/**
 * Convert API DTO to FormField
 *
 * @param dto - API response field DTO with server-provided key
 * @returns FormField with stable key from server
 */
export function toFormField(dto: ChallengeB2bFormAvailableFieldDto): FormField {
  return {
    key: dto.key,
    name: dto.name ?? null,
    displayName: dto.displayName,
    options: dto.options ?? null,
  };
}

/**
 * Check if field is a built-in field (has enum name)
 *
 * @param field - FormField to check
 * @returns true if built-in field, false if custom field
 */
export function isBuiltInField(field: FormField): boolean {
  return field.name !== null;
}

/**
 * Get input type based on options presence
 *
 * @param field - FormField to check
 * @returns 'text' for subjective input, 'select' for objective input
 */
export function getInputType(field: FormField): 'text' | 'select' {
  return field.options === null ? 'text' : 'select';
}

/**
 * Check if a Korean character has a final consonant (받침)
 *
 * @param char - Korean character to check
 * @returns true if character has final consonant
 */
function hasFinalConsonant(char: string): boolean {
  const code = char.charCodeAt(0);
  // Check if it's a valid Korean character (가-힣)
  if (code < 0xac00 || code > 0xd7a3) {
    return false;
  }
  // Korean characters: 0xAC00 + (initial × 588) + (medial × 28) + final
  // If final is 0, there's no final consonant
  return (code - 0xac00) % 28 !== 0;
}

/**
 * Get the last Korean character from a string, ignoring non-Korean characters
 *
 * @param text - Text to analyze (e.g., '지역(소재지)', '이름')
 * @returns Last Korean character or last character if no Korean found
 */
function getLastKoreanChar(text: string): string {
  // Find last Korean character (가-힣)
  for (let i = text.length - 1; i >= 0; i--) {
    const code = text.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      return text[i];
    }
  }
  // Fallback to last character
  return text[text.length - 1];
}

/**
 * Format field displayName as placeholder text with proper Korean particle
 *
 * @param displayName - Field display name (e.g., '사원번호', '이름', '지역(소재지)')
 * @returns Formatted placeholder (e.g., '사원번호를 입력해주세요', '이름을 입력해주세요', '지역(소재지)를 입력해주세요')
 */
export function formatPlaceholder(displayName: string): string {
  const lastChar = getLastKoreanChar(displayName);
  const particle = hasFinalConsonant(lastChar) ? '을' : '를';
  return `${displayName}${particle} 입력해주세요`;
}

/**
 * Transform form state to API request format
 *
 * Separates built-in fields (dedicated properties) from custom fields (array).
 * This maintains backward compatibility with existing API structure.
 *
 * @param formState - Current form values keyed by field.key
 * @param fields - Array of form fields with metadata
 * @returns API request object with built-in fields and customFormResponse
 */
export function transformToApiRequest(
  formState: FormState,
  fields: FormField[],
): JoinChallengeRequestCompanyJoinInfoDto {
  const request: JoinChallengeRequestCompanyJoinInfoDto = {};
  const customResponses: ChallengeB2bCustomFormResponseItemDto[] = [];

  fields.forEach(field => {
    const answer = formState[field.key];
    if (!answer) return;

    if (isBuiltInField(field)) {
      // Built-in: use dedicated properties
      // Use explicit property assignment for type safety
      const fieldName = field.name;
      if (fieldName === 'companyName') {
        request.companyName = answer;
      } else if (fieldName === 'participantName') {
        request.participantName = answer;
      } else if (fieldName === 'organizationName') {
        request.organizationName = answer;
      } else if (fieldName === 'employeeIdentificationNumber') {
        request.employeeIdentificationNumber = answer;
      }
    } else {
      // Custom: collect into array
      customResponses.push({
        key: field.key,
        answer: answer,
      });
    }
  });

  // Only include customFormResponse if there are custom fields
  if (customResponses.length > 0) {
    request.b2bCustomFormResponse = customResponses;
  }

  return request;
}

/**
 * Validate that all required fields are filled
 *
 * @param formState - Current form values
 * @param fields - Array of form fields
 * @returns Object with isValid flag and optional error message
 */
export function validateForm(
  formState: FormState,
  fields: FormField[],
): {isValid: boolean; errorMessage?: string} {
  const emptyFields = fields.filter(field => !formState[field.key]?.trim());

  if (emptyFields.length > 0) {
    const displayName = emptyFields[0].displayName;
    const lastChar = getLastKoreanChar(displayName);
    const particle = hasFinalConsonant(lastChar) ? '을' : '를';
    return {
      isValid: false,
      errorMessage: `${displayName}${particle} 입력해주세요.`,
    };
  }

  return {isValid: true};
}
