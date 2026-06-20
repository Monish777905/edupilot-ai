CREATE TABLE `activityGuides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(255) NOT NULL,
	`gradeLevel` varchar(50) NOT NULL,
	`activityType` enum('hands-on','experiment','group-discussion','interactive') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext NOT NULL,
	`instructions` json,
	`materials` json,
	`estimatedDuration` int,
	`learningOutcomes` json,
	`safetyNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activityGuides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audioRecordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`audioUrl` varchar(512) NOT NULL,
	`transcription` longtext,
	`language` enum('en','hi','hinglish') NOT NULL,
	`duration` int,
	`recordingType` enum('voice-input','tts-output') NOT NULL,
	`relatedContentType` enum('concept','quiz','translation','doubt','story','activity'),
	`relatedContentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audioRecordings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conceptSimplifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(255) NOT NULL,
	`gradeLevel` enum('beginner','intermediate','advanced') NOT NULL,
	`explanation` longtext NOT NULL,
	`keyPoints` json,
	`diagramUrl` varchar(512),
	`diagramType` enum('svg','text-art','image'),
	`flowchartUrl` varchar(512),
	`mindmapUrl` varchar(512),
	`audioUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conceptSimplifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentType` enum('concept','quiz','translation','whiteboard','doubt','story','lesson-plan','activity') NOT NULL,
	`contentId` int,
	`topic` varchar(255),
	`actionType` enum('created','viewed','completed','shared','favorited') NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doubtSolverChats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` int,
	`topic` varchar(255),
	`messages` json NOT NULL,
	`isResolved` boolean DEFAULT false,
	`helpfulRating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doubtSolverChats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessonPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(255) NOT NULL,
	`gradeLevel` varchar(50) NOT NULL,
	`durationMinutes` int NOT NULL,
	`learningObjectives` json,
	`teachingFlow` json,
	`activities` json,
	`quizTopics` json,
	`homework` json,
	`resources` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessonPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(255) NOT NULL,
	`questionCount` int NOT NULL,
	`quizType` enum('mcq','short-answer','mixed') NOT NULL DEFAULT 'mixed',
	`questions` json NOT NULL,
	`userAnswers` json,
	`score` decimal(5,2),
	`totalScore` decimal(5,2),
	`status` enum('draft','in-progress','completed') NOT NULL DEFAULT 'draft',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storyModeContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(255) NOT NULL,
	`gradeLevel` enum('primary','middle','secondary') NOT NULL,
	`storyTitle` varchar(255) NOT NULL,
	`storyContent` longtext NOT NULL,
	`illustrations` json,
	`audioUrl` varchar(512),
	`comprehensionQuestions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storyModeContent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalText` longtext NOT NULL,
	`originalLanguage` enum('en','hi','hinglish') NOT NULL,
	`translatedText` longtext NOT NULL,
	`targetLanguage` enum('en','hi','hinglish') NOT NULL,
	`audioOriginalUrl` varchar(512),
	`audioTranslatedUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whiteboardContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prompt` varchar(512) NOT NULL,
	`contentType` enum('diagram','concept-map','flowchart','illustration') NOT NULL,
	`svgContent` longtext,
	`textArtContent` longtext,
	`imageUrl` varchar(512),
	`labels` json,
	`annotations` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whiteboardContent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','teacher','student') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` enum('en','hi','hinglish') DEFAULT 'hinglish';