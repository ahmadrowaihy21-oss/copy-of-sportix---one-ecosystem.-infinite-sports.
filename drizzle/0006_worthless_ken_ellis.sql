ALTER TABLE `partner_accounts` MODIFY COLUMN `age` int;--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `gender` enum('male','female');--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `weeklySportFrequency` enum('0','1-2','3-4','5+');--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `currentSports` text;--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `aspirationalSport` varchar(160);--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `sportsChallenges` text;--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `sportsSolutionIdea` text;