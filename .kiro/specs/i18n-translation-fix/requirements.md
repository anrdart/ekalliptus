# Requirements Document

## Introduction

Memperbaiki warning i18n yang muncul karena missing translation keys di locale files. Website mendukung 7 bahasa (Indonesian, English, Japanese, Korean, Russian, Arabic, Turkish) dan semua translation keys harus tersedia di semua locale files.

## Glossary

- **i18n**: Internationalization - sistem untuk mendukung multiple bahasa
- **Locale**: File JSON yang berisi translation untuk satu bahasa
- **Translation Key**: Identifier unik untuk sebuah teks yang diterjemahkan
- **intlify**: Library i18n yang digunakan di Nuxt/Vue

## Requirements

### Requirement 1

**User Story:** As a developer, I want all translation keys to be defined in all locale files, so that there are no console warnings during development.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL NOT display any "[intlify] Not found" warnings in console
2. WHEN a translation key is used in a component THEN the system SHALL find the key in all 7 locale files

### Requirement 2

**User Story:** As a user, I want to see the order success page in my selected language, so that I understand the confirmation message.

#### Acceptance Criteria

1. WHEN a user completes an order THEN the system SHALL display orderSuccess.title in the selected language
2. WHEN a user completes an order THEN the system SHALL display orderSuccess.heading in the selected language
3. WHEN a user completes an order THEN the system SHALL display orderSuccess.message in the selected language
4. WHEN a user views the success page THEN the system SHALL display orderSuccess.backHome button in the selected language
5. WHEN a user views the success page THEN the system SHALL display orderSuccess.contactWhatsApp link in the selected language

### Requirement 3

**User Story:** As a user, I want to see the "Order Now" button on service cards in my selected language, so that I can navigate to the order page.

#### Acceptance Criteria

1. WHEN a user views service cards THEN the system SHALL display services.orderNow button text in the selected language
