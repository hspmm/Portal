	USE Master;
	GO
	IF EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = N'ICUMedicalPortal')
	DROP DATABASE ICUMedicalPortal;
	CREATE DATABASE ICUMedicalPortal;
	GO

	USE ICUMedicalPortal
	GO

	IF EXISTS (SELECT * FROM ICUMedicalPortal.INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'installation') BEGIN 
	drop table Installation
	END

	/****** Object:  Table [dbo].[Installation]    Script Date: 5/29/2020 1:08:38 PM ******/
	SET ANSI_NULLS ON
	GO

	SET QUOTED_IDENTIFIER ON
	GO

	CREATE TABLE [dbo].[Installation](
		[Uid] [uniqueidentifier] NOT NULL,
		[AppName] [varchar](255) NULL,
		[Version] [varchar](255) NULL,
	PRIMARY KEY CLUSTERED 
	(
		[Uid] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]
	GO

	ALTER TABLE [dbo].[Installation] ADD  DEFAULT (newid()) FOR [Uid]
	GO
	INSERT INTO [dbo].[Installation]
			([Uid]
			,[AppName]
			,[Version])
		VALUES
			(NEWID(),
			'ICU Medical Portal',
			'0.1')
	GO

	SELECT * FROM [dbo].[Installation]
	GO

	/****** Object:  Table [dbo].[Customers]    Script Date: 5/29/2020 1:28:00 PM ******/
	SET ANSI_NULLS ON
	GO

	SET QUOTED_IDENTIFIER ON
	GO

	CREATE TABLE [dbo].[Customers](
		[CustomerID] [nvarchar](255) NULL,
		[NodeID] [int] IDENTITY(1,1) NOT NULL,
		[NodeName] [nvarchar](255) NULL,
		[EmailID] [nvarchar](255) NULL,
		[Telephone] [nvarchar](255) NULL,
		[DomainName] [nvarchar](255) NULL,
		[CertificatePath] [nvarchar](255) NULL,
		[CertificateValidity] [nvarchar](255) NULL,
		[isCA] [nvarchar](255) NULL,
		[CertificateName] [nvarchar](255) NULL,
	PRIMARY KEY CLUSTERED 
	(
		[NodeID] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]
	GO

	/****** Object:  Table [dbo].[Nodes]    Script Date: 5/29/2020 1:28:35 PM ******/
	SET ANSI_NULLS ON
	GO

	SET QUOTED_IDENTIFIER ON
	GO

	CREATE TABLE [dbo].[Nodes](
		[Uid] [nvarchar](255) NOT NULL,
		[NodeID] [int] NULL,
		[NodeName] [nvarchar](255) NULL,
		[NodeShortName] [nvarchar](255) NULL,
		[ParentID] [int] NULL,
		[RootID] [nvarchar](255) NULL,
		[NodeType] [nvarchar](255) NULL,
		[TypeOf] [nvarchar](255) NULL,
		[NodeInfo] [nvarchar](4000) NULL,
		[CreatedDate] [datetimeoffset](7) NULL,
		[LastModifiedDate] [datetimeoffset](7) NULL,
		[TypeName] [nvarchar](255) NULL,
		[IconUrl] [nvarchar](max) NULL,
	PRIMARY KEY CLUSTERED 
	(
		[Uid] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
	GO


	/****** Object:  Table [dbo].[Plugins]    Script Date: 5/29/2020 1:30:55 PM ******/
	SET ANSI_NULLS ON
	GO

	SET QUOTED_IDENTIFIER ON
	GO

	CREATE TABLE [dbo].[Plugins](
		[Id] [int] IDENTITY(1,1) NOT NULL,
		[Uid] [nvarchar](255) NOT NULL,
		[Name] [nvarchar](255) NOT NULL,
		[UniqueName] [nvarchar](255) NOT NULL,
		[Version] [nvarchar](255) NOT NULL,
		[Description] [nvarchar](255) NULL,
		[UiPort] [nvarchar](255) NOT NULL,
		[BaseUrl] [nvarchar](255) NOT NULL,
		[Type] [nvarchar](255) NOT NULL,
		[Instances] [nvarchar](255) NULL,
		[ServerPort] [nvarchar](255) NOT NULL,
		[PrependUrl] [nvarchar](255) NOT NULL,
		[IconUrl] [nvarchar](max) NULL,
		[UiUrls] [nvarchar](max) NULL,
		[ServerUrls] [nvarchar](max) NULL,
		[IsRegistered] [bit] NOT NULL,
		[ServicesEnabled] [bit] NOT NULL,
		[IsLicenced] [bit] NULL,
		[IsActive] [bit] NOT NULL,
		[CreatedDate] [datetimeoffset](7) NULL,
		[LastModifiedDate] [datetimeoffset](7) NULL,
	PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
	GO


	/****** Object:  Table [dbo].[Products]    Script Date: 5/29/2020 1:31:44 PM ******/
	SET ANSI_NULLS ON
	GO

	SET QUOTED_IDENTIFIER ON
	GO

	CREATE TABLE [dbo].[Products](
		[Id] [int] IDENTITY(1,1) NOT NULL,
		[ProductUid] [nvarchar](255) NULL,
		[ProductName] [nvarchar](255) NULL,
		[Version] [nvarchar](255) NULL,
		[Description] [nvarchar](255) NULL,
		[FeatureList] [nvarchar](max) NULL,
		[DateCreated] [nvarchar](255) NULL,
		[DateUpdated] [nvarchar](255) NULL,
	PRIMARY KEY CLUSTERED 
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
	GO

	/****** Object:  Table [dbo].[RegisteredApplications]    Script Date: 5/29/2020 1:32:00 PM ******/
	SET ANSI_NULLS ON
	GO

	SET QUOTED_IDENTIFIER ON
	GO

	CREATE TABLE [dbo].[RegisteredApplications](
		[id] [int] IDENTITY(1,1) NOT NULL,
		[ApplicationId] [nvarchar](max) NOT NULL,
		[ApplicationName] [nvarchar](max) NOT NULL,
		[ApplicationVersion] [nvarchar](255) NOT NULL,
		[ApplicationGuid] [nvarchar](255) NOT NULL,
		[ApplicationSecret] [nvarchar](max) NOT NULL,
		[CreatedDate] [datetimeoffset](7) NULL,
		[LastModifiedDate] [datetimeoffset](7) NULL,
	PRIMARY KEY CLUSTERED 
	(
		[id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
	GO



	/****** Object:  Table [dbo].[SessionLogs]    Script Date: 5/29/2020 1:32:14 PM ******/
	SET ANSI_NULLS ON
	GO

	SET QUOTED_IDENTIFIER ON
	GO

	CREATE TABLE [dbo].[SessionLogs](
		[sid] [nvarchar](255) NOT NULL,
		[userName] [nvarchar](255) NOT NULL,
		[expires] [datetimeoffset](7) NOT NULL,
		[createdAt] [datetimeoffset](7) NOT NULL,
		[updatedAt] [datetimeoffset](7) NOT NULL,
	PRIMARY KEY CLUSTERED 
	(
		[sid] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]
	GO

	/****** Object:  Table [dbo].[Sessions]    Script Date: 6/17/2020 4:55:43 PM ******/
	SET ANSI_NULLS ON
	GO

	SET QUOTED_IDENTIFIER ON
	GO

	CREATE TABLE [dbo].[Sessions](
		[sid] [nvarchar](255) NOT NULL,
		[userName] [nvarchar](255) NULL,
		[accessToken] [nvarchar](max) NULL,
		[refreshToken] [nvarchar](max) NULL,
		[privileges] [nvarchar](max) NULL,
		[expires] [datetimeoffset](7) NULL,
		[data] [nvarchar](max) NULL,
		[tokenTimeOutInterval] [nvarchar](max) NULL,
		[tokenRefreshedAt] [datetimeoffset](7) NULL,
		[createdAt] [datetimeoffset](7) NOT NULL,
		[updatedAt] [datetimeoffset](7) NOT NULL,
	PRIMARY KEY CLUSTERED 
	(
		[sid] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
	GO


