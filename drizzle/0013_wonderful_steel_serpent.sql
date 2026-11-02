DROP TABLE `partner_nda_applications`;--> statement-breakpoint
DROP TABLE `partner_nda_approval_links`;--> statement-breakpoint
UPDATE `partner_accounts` SET `status` = 'active' WHERE `status` IN ('pending_nda', 'pending_approval');--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `status` enum('active','disabled','email_unverified','approved','rejected','suspended') NOT NULL DEFAULT 'email_unverified';
