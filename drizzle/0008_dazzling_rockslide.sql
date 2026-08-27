CREATE TABLE `nda_acceptances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`acceptanceId` varchar(96) NOT NULL,
	`accountId` int NOT NULL,
	`ndaDocumentId` int NOT NULL,
	`acceptanceStatus` enum('accepted') NOT NULL DEFAULT 'accepted',
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`requestIp` varchar(64),
	`userAgent` varchar(800),
	`browser` varchar(160),
	`deviceInfo` varchar(240),
	`emailVerificationStatus` varchar(32) NOT NULL,
	`emailVerifiedAt` timestamp,
	`authorityAnswer` enum('yes','no'),
	`authorityDeclaredAt` timestamp,
	`companyNdaStorageKey` varchar(512),
	`companyNdaStorageUrl` varchar(700),
	`companyNdaMimeType` varchar(96),
	`evidenceStorageKey` varchar(512),
	`evidenceStorageUrl` varchar(700),
	`evidenceHash` varchar(64),
	`adminStatus` varchar(32) NOT NULL,
	`adminReviewerUserId` int,
	`adminReviewedAt` timestamp,
	CONSTRAINT `nda_acceptances_id` PRIMARY KEY(`id`),
	CONSTRAINT `nda_acceptances_acceptanceId_unique` UNIQUE(`acceptanceId`)
);
--> statement-breakpoint
CREATE TABLE `nda_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` varchar(32) NOT NULL,
	`documentId` varchar(96) NOT NULL,
	`effectiveDate` varchar(16) NOT NULL,
	`jurisdiction` varchar(160) NOT NULL,
	`controllingLanguage` varchar(32) NOT NULL,
	`agreedCompensation` varchar(64) NOT NULL,
	`contentSnapshot` text NOT NULL,
	`contentHash` varchar(64) NOT NULL,
	`sourceStorageKey` varchar(512) NOT NULL,
	`sourceStorageUrl` varchar(700) NOT NULL,
	`immutableLockedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nda_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `nda_documents_version_unique` UNIQUE(`version`),
	CONSTRAINT `nda_documents_documentId_unique` UNIQUE(`documentId`)
);
--> statement-breakpoint
CREATE TABLE `partner_audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int,
	`actorUserId` int,
	`action` varchar(64) NOT NULL,
	`requestIp` varchar(64),
	`userAgent` varchar(800),
	`relatedRecordId` varchar(96),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `mobileNumber` varchar(32);--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `status` enum('pending','active','disabled','email_unverified','nda_pending','company_authority_pending','company_nda_pending','pending_approval','pending_admin_approval','approved','rejected','suspended') NOT NULL DEFAULT 'email_unverified';--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `emailVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `verificationMethod` varchar(32);--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `verificationStatus` enum('pending','verified','failed','expired','used') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `accessLevel` enum('level_1','level_2','level_3') DEFAULT 'level_1' NOT NULL;--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `level3ApprovedAt` timestamp;--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `moreInformationRequest` text;