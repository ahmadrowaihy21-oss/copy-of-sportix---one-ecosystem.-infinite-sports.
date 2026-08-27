ALTER TABLE `partner_accounts` ADD `age` int;--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `gender` enum('male','female');--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `weeklySportFrequency` enum('0','1-2','3-4','5+');--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `currentSports` text;--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `aspirationalSport` varchar(160);--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `sportsChallenges` text;--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `sportsSolutionIdea` text;--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `profileImageKey` varchar(512);--> statement-breakpoint
ALTER TABLE `partner_accounts` ADD `profileImageUrl` varchar(700);
