CREATE TABLE `partner_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`mobileNumber` varchar(32) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`companyName` varchar(200),
	`jobTitle` varchar(160),
	`status` enum('pending','active','disabled') NOT NULL DEFAULT 'pending',
	`emailVerifiedAt` timestamp,
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_accounts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `partner_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_sessions_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `partner_verification_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`codeHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`attempts` int NOT NULL DEFAULT 0,
	`requestIp` varchar(64),
	`resendEmailId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_verification_codes_id` PRIMARY KEY(`id`)
);
