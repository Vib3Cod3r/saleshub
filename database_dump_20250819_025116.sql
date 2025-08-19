--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ActivityType" AS ENUM (
    'GENERAL',
    'LOGIN',
    'LOGOUT',
    'CREATE_LEAD',
    'UPDATE_LEAD',
    'CREATE_DEAL',
    'UPDATE_DEAL',
    'CREATE_TASK',
    'COMPLETE_TASK',
    'CREATE_NOTE',
    'SEND_MESSAGE',
    'MAKE_CALL'
);


ALTER TYPE public."ActivityType" OWNER TO postgres;

--
-- Name: DealStage; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DealStage" AS ENUM (
    'LEAD',
    'CONTACT_MADE',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'CLOSED_WON',
    'CLOSED_LOST'
);


ALTER TYPE public."DealStage" OWNER TO postgres;

--
-- Name: Direction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Direction" AS ENUM (
    'INBOUND',
    'OUTBOUND'
);


ALTER TYPE public."Direction" OWNER TO postgres;

--
-- Name: LeadSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LeadSource" AS ENUM (
    'WEBSITE',
    'REFERRAL',
    'SOCIAL_MEDIA',
    'EMAIL_CAMPAIGN',
    'COLD_CALL',
    'TRADE_SHOW',
    'OTHER'
);


ALTER TYPE public."LeadSource" OWNER TO postgres;

--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'CLOSED_WON',
    'CLOSED_LOST',
    'DISQUALIFIED'
);


ALTER TYPE public."LeadStatus" OWNER TO postgres;

--
-- Name: MessageStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MessageStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED'
);


ALTER TYPE public."MessageStatus" OWNER TO postgres;

--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MessageType" AS ENUM (
    'EMAIL',
    'SMS',
    'WHATSAPP',
    'LINKEDIN',
    'OTHER'
);


ALTER TYPE public."MessageType" OWNER TO postgres;

--
-- Name: NoteType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NoteType" AS ENUM (
    'GENERAL',
    'CALL_SUMMARY',
    'MEETING_NOTES',
    'PROPOSAL_FEEDBACK',
    'NEGOTIATION_NOTES',
    'CLOSING_NOTES'
);


ALTER TYPE public."NoteType" OWNER TO postgres;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."Priority" OWNER TO postgres;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TaskStatus" OWNER TO postgres;

--
-- Name: TaskType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskType" AS ENUM (
    'CALL',
    'EMAIL',
    'MEETING',
    'FOLLOW_UP',
    'PROPOSAL',
    'CONTRACT',
    'OTHER'
);


ALTER TYPE public."TaskType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'SALES_MANAGER',
    'SALES_REP'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id text NOT NULL,
    type public."ActivityType" DEFAULT 'GENERAL'::public."ActivityType" NOT NULL,
    title text NOT NULL,
    description text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    action text NOT NULL,
    field_name text,
    old_value text,
    new_value text,
    user_id uuid,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: address_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.address_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.address_types OWNER TO postgres;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    street1 text,
    street2 text,
    city text,
    state text,
    postal_code text,
    country text,
    is_primary boolean DEFAULT false,
    type_id uuid,
    entity_id uuid NOT NULL,
    entity_type text NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: TABLE addresses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.addresses IS 'Polymorphic table for addresses. EntityID references different tables based on EntityType.';


--
-- Name: calls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calls (
    id text NOT NULL,
    subject text,
    description text,
    duration integer,
    outcome text,
    "scheduledAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "contactId" text,
    "dealId" text,
    "leadId" text,
    "assignedToId" text,
    "createdById" text NOT NULL
);


ALTER TABLE public.calls OWNER TO postgres;

--
-- Name: communication_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communication_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    filename text NOT NULL,
    original_name text NOT NULL,
    mime_type text NOT NULL,
    size bigint NOT NULL,
    url text NOT NULL,
    communication_id uuid NOT NULL,
    created_at timestamp with time zone
);


ALTER TABLE public.communication_attachments OWNER TO postgres;

--
-- Name: communication_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communication_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    icon text,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.communication_types OWNER TO postgres;

--
-- Name: communications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_id uuid,
    subject text,
    content text,
    direction text NOT NULL,
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    received_at timestamp with time zone,
    external_id text,
    user_id uuid,
    contact_id uuid,
    lead_id uuid,
    deal_id uuid,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.communications OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    website text,
    domain text,
    industry_id uuid,
    size_id uuid,
    revenue numeric(15,2),
    external_id text,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by text,
    deleted_at timestamp with time zone,
    tax_id character varying(50),
    duns_number character varying(20),
    naics_code character varying(10),
    sic_code character varying(10),
    founded_year integer,
    employee_count integer,
    annual_revenue numeric(15,2),
    credit_rating character varying(10),
    parent_company_id uuid,
    subsidiary_count integer DEFAULT 0,
    industry_sector character varying(100),
    business_model character varying(100),
    target_market character varying(200),
    key_products text[],
    certifications text[],
    social_media jsonb,
    notes text,
    last_contact_date date,
    next_follow_up_date date,
    lead_source character varying(100),
    lead_score integer DEFAULT 0,
    status character varying(50) DEFAULT 'Active'::character varying,
    priority character varying(20) DEFAULT 'Medium'::character varying,
    assigned_to uuid,
    tags text[],
    custom_data jsonb
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: company_sizes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_sizes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    min_employees bigint,
    max_employees bigint,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.company_sizes OWNER TO postgres;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    title text,
    department text,
    company_id uuid,
    original_source text,
    email_opt_in boolean DEFAULT true,
    sms_opt_in boolean DEFAULT false,
    call_opt_in boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by text,
    deleted_at timestamp with time zone,
    owner_id uuid
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- Name: custom_field_definitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_field_definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    entity_type character varying(50) NOT NULL,
    field_name character varying(100) NOT NULL,
    field_label character varying(200) NOT NULL,
    field_type character varying(50) NOT NULL,
    field_options jsonb,
    is_required boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.custom_field_definitions OWNER TO postgres;

--
-- Name: custom_field_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_field_values (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    field_id uuid NOT NULL,
    entity_id uuid NOT NULL,
    entity_type text NOT NULL,
    text_value text,
    number_value bigint,
    decimal_value numeric(15,2),
    boolean_value boolean,
    date_value timestamp with time zone,
    json_value jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.custom_field_values OWNER TO postgres;

--
-- Name: custom_fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_fields (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    label text NOT NULL,
    type text NOT NULL,
    entity_type text NOT NULL,
    is_required boolean DEFAULT false,
    is_unique boolean DEFAULT false,
    default_value text,
    options jsonb,
    lookup_entity text,
    validation jsonb,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.custom_fields OWNER TO postgres;

--
-- Name: custom_objects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    label text NOT NULL,
    plural_label text NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.custom_objects OWNER TO postgres;

--
-- Name: deal_stage_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deal_stage_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deal_id uuid NOT NULL,
    from_stage_id uuid,
    to_stage_id uuid NOT NULL,
    from_amount numeric(15,2),
    to_amount numeric(15,2),
    from_probability bigint,
    to_probability bigint,
    from_currency text,
    to_currency text,
    from_expected_close_date timestamp with time zone,
    to_expected_close_date timestamp with time zone,
    change_reason text,
    notes text,
    moved_at timestamp with time zone,
    moved_by text
);


ALTER TABLE public.deal_stage_history OWNER TO postgres;

--
-- Name: deals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    amount numeric(15,2),
    currency text DEFAULT 'USD'::text,
    probability bigint DEFAULT 0,
    pipeline_id uuid NOT NULL,
    stage_id uuid NOT NULL,
    expected_close_date timestamp with time zone,
    actual_close_date timestamp with time zone,
    company_id uuid,
    contact_id uuid,
    assigned_user_id uuid,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.deals OWNER TO postgres;

--
-- Name: email_address_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_address_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.email_address_types OWNER TO postgres;

--
-- Name: email_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    is_primary boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    type_id uuid,
    entity_id uuid NOT NULL,
    entity_type text NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT chk_email_entity_type CHECK ((entity_type = ANY (ARRAY['Contact'::text, 'Company'::text, 'Lead'::text, 'Deal'::text])))
);


ALTER TABLE public.email_addresses OWNER TO postgres;

--
-- Name: TABLE email_addresses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.email_addresses IS 'Polymorphic table for email addresses. EntityID references different tables based on EntityType.';


--
-- Name: industries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.industries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.industries OWNER TO postgres;

--
-- Name: lead_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_statuses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    color text,
    "order" bigint NOT NULL,
    is_active boolean DEFAULT true,
    is_system boolean DEFAULT false,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.lead_statuses OWNER TO postgres;

--
-- Name: lead_temperatures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_temperatures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    color text,
    "order" bigint NOT NULL,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.lead_temperatures OWNER TO postgres;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text,
    last_name text,
    title text,
    status_id uuid,
    temperature_id uuid,
    source text,
    campaign text,
    score bigint DEFAULT 0,
    company_id uuid,
    contact_id uuid,
    assigned_user_id uuid,
    marketing_source_id uuid,
    converted_at timestamp with time zone,
    converted_to_deal_id text,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.leads OWNER TO postgres;

--
-- Name: marketing_asset_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_asset_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    color text,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.marketing_asset_types OWNER TO postgres;

--
-- Name: marketing_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type_id uuid,
    url text,
    content text,
    views bigint DEFAULT 0,
    clicks bigint DEFAULT 0,
    conversions bigint DEFAULT 0,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.marketing_assets OWNER TO postgres;

--
-- Name: marketing_source_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_source_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    color text,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.marketing_source_types OWNER TO postgres;

--
-- Name: marketing_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type_id uuid,
    medium text,
    campaign text,
    source text,
    content text,
    term text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_content text,
    utm_term text,
    cost numeric(15,2),
    impressions bigint,
    clicks bigint,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.marketing_sources OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id text NOT NULL,
    subject text,
    content text NOT NULL,
    type public."MessageType" DEFAULT 'EMAIL'::public."MessageType" NOT NULL,
    direction public."Direction" DEFAULT 'OUTBOUND'::public."Direction" NOT NULL,
    status public."MessageStatus" DEFAULT 'DRAFT'::public."MessageStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "contactId" text,
    "dealId" text,
    "leadId" text,
    "assignedToId" text,
    "createdById" text NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notes (
    id text NOT NULL,
    title text,
    content text NOT NULL,
    type public."NoteType" DEFAULT 'GENERAL'::public."NoteType" NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "contactId" text,
    "dealId" text,
    "leadId" text,
    "assignedToId" text,
    "createdById" text NOT NULL
);


ALTER TABLE public.notes OWNER TO postgres;

--
-- Name: phone_number_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.phone_number_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.phone_number_types OWNER TO postgres;

--
-- Name: phone_numbers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.phone_numbers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number text NOT NULL,
    extension text,
    is_primary boolean DEFAULT false,
    type_id uuid,
    entity_id uuid NOT NULL,
    entity_type text NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT chk_phone_entity_type CHECK ((entity_type = ANY (ARRAY['Contact'::text, 'Company'::text, 'Lead'::text, 'Deal'::text])))
);


ALTER TABLE public.phone_numbers OWNER TO postgres;

--
-- Name: TABLE phone_numbers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.phone_numbers IS 'Polymorphic table for phone numbers. EntityID references different tables based on EntityType.';


--
-- Name: pipelines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pipelines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.pipelines OWNER TO postgres;

--
-- Name: social_media_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_media_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text,
    url text,
    is_primary boolean DEFAULT false,
    type_id uuid,
    entity_id uuid NOT NULL,
    entity_type text NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.social_media_accounts OWNER TO postgres;

--
-- Name: TABLE social_media_accounts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.social_media_accounts IS 'Polymorphic table for social media accounts. EntityID references different tables based on EntityType.';


--
-- Name: social_media_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_media_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    icon text,
    base_url text,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.social_media_types OWNER TO postgres;

--
-- Name: stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "order" bigint NOT NULL,
    probability bigint DEFAULT 0,
    is_closed_won boolean DEFAULT false,
    is_closed_lost boolean DEFAULT false,
    color text,
    pipeline_id uuid NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.stages OWNER TO postgres;

--
-- Name: task_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    color text,
    icon text,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.task_types OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    type_id uuid,
    priority text DEFAULT 'MEDIUM'::text,
    status text DEFAULT 'PENDING'::text,
    due_date timestamp with time zone,
    completed_at timestamp with time zone,
    assigned_user_id uuid,
    created_by uuid,
    lead_id uuid,
    deal_id uuid,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    subdomain text NOT NULL,
    is_active boolean DEFAULT true,
    settings jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: territories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.territories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type_id uuid,
    countries text[],
    states text[],
    cities text[],
    postal_codes text[],
    industries text[],
    company_size text[],
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.territories OWNER TO postgres;

--
-- Name: territory_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.territory_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.territory_types OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    is_system boolean DEFAULT false,
    permissions jsonb,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: user_territories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_territories (
    territory_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.user_territories OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    password text NOT NULL,
    avatar text,
    is_active boolean DEFAULT true,
    role_id uuid,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, type, title, description, metadata, "createdAt", "userId") FROM stdin;
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, entity_type, entity_id, action, field_name, old_value, new_value, user_id, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: address_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.address_types (id, name, code, description, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
d931297e-8f4e-42bf-881b-3362c4f35754	Home	HOME	Home address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.475506+00	2025-08-15 08:15:49.475506+00	\N
575555b6-e01a-4991-a6ba-a88e5da3d3d5	Work	WORK	Work address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.478841+00	2025-08-15 08:15:49.478841+00	\N
d0991f00-e41f-41b0-a291-8132fd10384c	Billing	BILLING	Billing address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.481274+00	2025-08-15 08:15:49.481274+00	\N
7f54a2a0-b109-4a19-b501-f4f536f531ad	Shipping	SHIPPING	Shipping address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.483469+00	2025-08-15 08:15:49.483469+00	\N
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, street1, street2, city, state, postal_code, country, is_primary, type_id, entity_id, entity_type, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: calls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calls (id, subject, description, duration, outcome, "scheduledAt", "completedAt", metadata, "createdAt", "updatedAt", "contactId", "dealId", "leadId", "assignedToId", "createdById") FROM stdin;
\.


--
-- Data for Name: communication_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.communication_attachments (id, filename, original_name, mime_type, size, url, communication_id, created_at) FROM stdin;
\.


--
-- Data for Name: communication_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.communication_types (id, name, code, description, icon, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: communications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.communications (id, type_id, subject, content, direction, scheduled_at, sent_at, received_at, external_id, user_id, contact_id, lead_id, deal_id, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, website, domain, industry_id, size_id, revenue, external_id, tenant_id, created_at, updated_at, created_by, deleted_at, tax_id, duns_number, naics_code, sic_code, founded_year, employee_count, annual_revenue, credit_rating, parent_company_id, subsidiary_count, industry_sector, business_model, target_market, key_products, certifications, social_media, notes, last_contact_date, next_follow_up_date, lead_source, lead_score, status, priority, assigned_to, tags, custom_data) FROM stdin;
e124301d-e9af-42c1-a361-0c0882547f7a	TechCorp Solutions	https://techcorp.com	\N	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	\N	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 13:11:19.379094+00	2025-08-14 13:11:19.379094+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
b5de6862-01e7-4e04-a831-3dfe95563c9c	TechCorp Solutions	https://techcorp.com	techcorp.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	25000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.516964+00	2025-08-15 08:10:15.516964+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
7d89c2bd-9fd9-4bf2-b5f9-644e244afe65	HealthFirst Medical	https://healthfirst.com	healthfirst.com	c94caae6-5d0c-449e-939d-58ef35462ddb	536bf6db-1ba6-4549-ad8c-687095c5e195	8500000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.524931+00	2025-08-15 08:10:15.524931+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
6b2e822a-b5c8-480d-ac5e-7a3e0ec78e98	Global Finance Group	https://globalfinance.com	globalfinance.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	150000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.528888+00	2025-08-15 08:10:15.528888+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
8152c747-c080-46cb-86a4-730ef9e79f7b	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	77677d26-f561-4632-8487-14b177da9858	45000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.531648+00	2025-08-15 08:10:15.531648+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
cc5c3527-dc17-48b7-830e-c24d5378861a	Retail Plus Stores	https://retailplus.com	retailplus.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	12000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.533886+00	2025-08-15 08:10:15.533886+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
30d8b0b0-2d20-427f-a456-f261f662ba99	TechCorp Solutions	https://techcorp.com	techcorp.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	25000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.513968+00	2025-08-15 08:11:07.513968+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
82394f79-e8ee-41c9-94bf-1ff2acad6975	HealthFirst Medical	https://healthfirst.com	healthfirst.com	c94caae6-5d0c-449e-939d-58ef35462ddb	536bf6db-1ba6-4549-ad8c-687095c5e195	8500000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.521768+00	2025-08-15 08:11:07.521768+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
91ebf292-9cfc-494d-957e-ee34f9137fec	Global Finance Group	https://globalfinance.com	globalfinance.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	150000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.52369+00	2025-08-15 08:11:07.52369+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
570512eb-aabf-42b9-b485-3df0effee807	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	77677d26-f561-4632-8487-14b177da9858	45000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.52565+00	2025-08-15 08:11:07.52565+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
af5e910f-9054-4c3f-b509-c3815aaade72	Retail Plus Stores	https://retailplus.com	retailplus.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	12000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.528476+00	2025-08-15 08:11:07.528476+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
e8849080-2368-478d-b4ce-b87ebd7974b2	TechCorp Solutions	https://techcorp.com	techcorp.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	25000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.926212+00	2025-08-15 08:14:15.926212+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
e23a12d3-3380-4918-ac31-39bfe80a8211	HealthFirst Medical	https://healthfirst.com	healthfirst.com	c94caae6-5d0c-449e-939d-58ef35462ddb	536bf6db-1ba6-4549-ad8c-687095c5e195	8500000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.934181+00	2025-08-15 08:14:15.934181+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
50ea3d2c-f3e3-4460-ad34-49bdb87a325a	Global Finance Group	https://globalfinance.com	globalfinance.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	150000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.936614+00	2025-08-15 08:14:15.936614+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
04ba9ed7-7b34-4442-9fae-6367d79481cf	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	77677d26-f561-4632-8487-14b177da9858	45000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.938972+00	2025-08-15 08:14:15.938972+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
d6d87d98-9660-4cfc-85c0-2e2df0ebe0e9	Retail Plus Stores	https://retailplus.com	retailplus.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	12000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.941279+00	2025-08-15 08:14:15.941279+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
ec4f7848-824e-4fb6-9551-ea1473dcfb3f	TechCorp Solutions	https://techcorp.com	techcorp.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	74046472.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.15318+00	2025-08-15 08:22:51.15318+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
ca85637b-3852-444f-af3f-a42b032191be	HealthFirst Medical	https://healthfirst.com	healthfirst.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	65154382.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.161512+00	2025-08-15 08:22:51.161512+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
7c7644ee-cb23-4dfb-8ed5-39edae86c278	Global Finance Group	https://globalfinance.com	globalfinance.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	26560897.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.164674+00	2025-08-15 08:22:51.164674+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
6c1effb0-40d8-4e3c-ad9a-1a80f7371bf6	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	6401692.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.167834+00	2025-08-15 08:22:51.167834+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
9dc9056f-a165-4002-a9a6-552dd5305f7a	Retail Plus Stores	https://retailplus.com	retailplus.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	8477326.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.170249+00	2025-08-15 08:22:51.170249+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
005fd3c7-3b66-4d04-a14f-c719a3147f1d	Digital Dynamics	https://digitaldynamics.com	digitaldynamics.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	536bf6db-1ba6-4549-ad8c-687095c5e195	46744236.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.17247+00	2025-08-15 08:22:51.17247+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
a438d48a-ee50-448e-852e-7a7d4d5c704b	Green Energy Corp	https://greenenergy.com	greenenergy.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	536bf6db-1ba6-4549-ad8c-687095c5e195	96223370.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.174655+00	2025-08-15 08:22:51.174655+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
216032e1-d6c7-4a1f-a012-08c08b627b8d	Creative Marketing Agency	https://creativemarketing.com	creativemarketing.com	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	44037720.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.17665+00	2025-08-15 08:22:51.17665+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
a8eb5b3c-2efc-40f7-b64b-e05ce198507d	Legal Associates LLP	https://legalassociates.com	legalassociates.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	57094228.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.180458+00	2025-08-15 08:22:51.180458+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
139e04fa-bdec-43d5-bb91-2848815d7a07	Educational Excellence	https://educationalexcellence.com	educationalexcellence.com	ed699425-b383-4835-8ce4-e180956ac4fe	04ac49c0-e454-4b18-b5df-10469daaab30	88847850.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.183449+00	2025-08-15 08:22:51.183449+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
63ac9507-3b40-4410-96f6-deaf949d8aa9	Transportation Solutions	https://transportationsolutions.com	transportationsolutions.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	26785350.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.18646+00	2025-08-15 08:22:51.18646+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
ea6652d1-dbd5-4bee-a831-60b6aacd706a	Real Estate Partners	https://realestatepartners.com	realestatepartners.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	3104749.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.18958+00	2025-08-15 08:22:51.18958+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
be65e1b5-8ce7-4426-b5f8-1625321a854c	Consulting Experts	https://consultingexperts.com	consultingexperts.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	79620047.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.192434+00	2025-08-15 08:22:51.192434+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
a3933216-7f83-41aa-953a-c805b5c47789	Food & Beverage Co	https://foodbeverage.com	foodbeverage.com	c94caae6-5d0c-449e-939d-58ef35462ddb	04ac49c0-e454-4b18-b5df-10469daaab30	44560805.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.195072+00	2025-08-15 08:22:51.195072+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
cfca2e1f-8426-47f9-b582-07400862bd4c	Entertainment Studios	https://entertainmentstudios.com	entertainmentstudios.com	ed699425-b383-4835-8ce4-e180956ac4fe	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	48622503.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.198657+00	2025-08-15 08:22:51.198657+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
35b59ce3-077f-4ea3-b57d-afc7b50e6613	TechCorp Solutions	https://techcorp.com	techcorp.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	536bf6db-1ba6-4549-ad8c-687095c5e195	49515629.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.391048+00	2025-08-17 16:27:08.391048+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
64c5858d-837d-4ad3-9878-cf5d29e7dd56	HealthFirst Medical	https://healthfirst.com	healthfirst.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	77626131.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.394933+00	2025-08-17 16:27:08.394933+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
01be7874-0098-4ec5-9d48-9393ca57bc98	Global Finance Group	https://globalfinance.com	globalfinance.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	77677d26-f561-4632-8487-14b177da9858	40626958.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.398127+00	2025-08-17 16:27:08.398127+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
a94483dd-5541-4a47-a4ff-7fca34c3c0dc	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	536bf6db-1ba6-4549-ad8c-687095c5e195	39781067.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.400456+00	2025-08-17 16:27:08.400456+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
1f8f16a7-3562-4df8-bbdc-a0e4b6e14cee	Retail Plus Stores	https://retailplus.com	retailplus.com	c94caae6-5d0c-449e-939d-58ef35462ddb	04ac49c0-e454-4b18-b5df-10469daaab30	72387112.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.403094+00	2025-08-17 16:27:08.403094+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
446386c2-676b-47e4-bf0b-e05774eb791a	Digital Dynamics	https://digitaldynamics.com	digitaldynamics.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	5391476.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.405889+00	2025-08-17 16:27:08.405889+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
88463116-9630-499e-8ae9-76aeacf2851f	Green Energy Corp	https://greenenergy.com	greenenergy.com	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	2065227.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.408302+00	2025-08-17 16:27:08.408302+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
233915d4-3561-4a96-b8f4-539aee58d54a	Creative Marketing Agency	https://creativemarketing.com	creativemarketing.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	536bf6db-1ba6-4549-ad8c-687095c5e195	27411647.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.411753+00	2025-08-17 16:27:08.411753+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
08d8f3c1-53ff-4445-9832-a1b02b3e0a98	Legal Associates LLP	https://legalassociates.com	legalassociates.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	19209740.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.41415+00	2025-08-17 16:27:08.41415+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
4ccc9467-319f-468b-9b6a-ce29a5195ed6	Educational Excellence	https://educationalexcellence.com	educationalexcellence.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	95409428.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.416226+00	2025-08-17 16:27:08.416226+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
f95d5433-17a8-4a25-8a87-dfad8ac5793d	Transportation Solutions	https://transportationsolutions.com	transportationsolutions.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	77677d26-f561-4632-8487-14b177da9858	30528825.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.418645+00	2025-08-17 16:27:08.418645+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
c920fe2a-7619-46cf-80cd-18d08eceba2b	Real Estate Partners	https://realestatepartners.com	realestatepartners.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	50684754.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.420692+00	2025-08-17 16:27:08.420692+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
1de20cb2-4b55-4a4d-9eba-f10e78c4e09f	Consulting Experts	https://consultingexperts.com	consultingexperts.com	ed699425-b383-4835-8ce4-e180956ac4fe	04ac49c0-e454-4b18-b5df-10469daaab30	3796348.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.424963+00	2025-08-17 16:27:08.424963+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
6d8cd793-a016-4ab7-9b39-b65b6aaecd0e	Food & Beverage Co	https://foodbeverage.com	foodbeverage.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	36379227.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.427658+00	2025-08-17 16:27:08.427658+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
c2c99d42-6aab-4af6-9f5f-1c9833d34799	Entertainment Studios	https://entertainmentstudios.com	entertainmentstudios.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	77445067.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.431388+00	2025-08-17 16:27:08.431388+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
d0f76f75-3ae1-4cdd-9992-834dd2c73352	TechCorp Solutions	https://techcorp.com	techcorp.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	536bf6db-1ba6-4549-ad8c-687095c5e195	15821534.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.915714+00	2025-08-18 02:55:14.915714+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
44559722-1c94-4a08-a4ca-e261232fc1dc	HealthFirst Medical	https://healthfirst.com	healthfirst.com	ed699425-b383-4835-8ce4-e180956ac4fe	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	82322895.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.923944+00	2025-08-18 02:55:14.923944+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
79920099-87c1-4d41-a729-e0d094024b16	Global Finance Group	https://globalfinance.com	globalfinance.com	c94caae6-5d0c-449e-939d-58ef35462ddb	04ac49c0-e454-4b18-b5df-10469daaab30	22668557.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.926127+00	2025-08-18 02:55:14.926127+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
cf8480e6-4b3d-4019-8609-55d1c281f9da	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	bd53cb65-5771-469f-8a74-3c843566505b	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	50412377.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.928107+00	2025-08-18 02:55:14.928107+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
63b90681-c4e2-4cbb-befc-fa91dff784ff	Retail Plus Stores	https://retailplus.com	retailplus.com	c94caae6-5d0c-449e-939d-58ef35462ddb	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	26035353.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.930145+00	2025-08-18 02:55:14.930145+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
34021023-0fb6-4c0d-9bcd-d6837527fbeb	Digital Dynamics	https://digitaldynamics.com	digitaldynamics.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	14804854.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.932007+00	2025-08-18 02:55:14.932007+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
3a794c42-3fba-4420-9429-e8f748b8df62	Green Energy Corp	https://greenenergy.com	greenenergy.com	c94caae6-5d0c-449e-939d-58ef35462ddb	536bf6db-1ba6-4549-ad8c-687095c5e195	32028443.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.933836+00	2025-08-18 02:55:14.933836+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
9c4b0c2c-a0c0-4a83-b3e0-a49720c81efa	Creative Marketing Agency	https://creativemarketing.com	creativemarketing.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	536bf6db-1ba6-4549-ad8c-687095c5e195	44524189.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.93549+00	2025-08-18 02:55:14.93549+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
5dd6c10e-e69f-4605-af41-15a4bfcd08b9	Legal Associates LLP	https://legalassociates.com	legalassociates.com	c94caae6-5d0c-449e-939d-58ef35462ddb	77677d26-f561-4632-8487-14b177da9858	74930966.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.937527+00	2025-08-18 02:55:14.937527+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
6e29d6c2-227a-4659-8e7c-dd92252ab48e	Educational Excellence	https://educationalexcellence.com	educationalexcellence.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	04ac49c0-e454-4b18-b5df-10469daaab30	60869794.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.939959+00	2025-08-18 02:55:14.939959+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
57067e69-33eb-49da-aa15-16734a81c54c	Transportation Solutions	https://transportationsolutions.com	transportationsolutions.com	ed699425-b383-4835-8ce4-e180956ac4fe	04ac49c0-e454-4b18-b5df-10469daaab30	40334594.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.942334+00	2025-08-18 02:55:14.942334+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
e1610917-e0ac-4ca7-b679-41f9fd999ede	Real Estate Partners	https://realestatepartners.com	realestatepartners.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	536bf6db-1ba6-4549-ad8c-687095c5e195	78684628.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.944366+00	2025-08-18 02:55:14.944366+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
6ebdf198-7536-4165-a182-8662e0669bcc	Consulting Experts	https://consultingexperts.com	consultingexperts.com	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	15975195.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.946329+00	2025-08-18 02:55:14.946329+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
cf676777-5028-4d3b-b495-86915b78be21	Food & Beverage Co	https://foodbeverage.com	foodbeverage.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	17208605.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.948109+00	2025-08-18 02:55:14.948109+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
c22d69b8-2733-47dc-804d-fa156cb38bc2	Entertainment Studios	https://entertainmentstudios.com	entertainmentstudios.com	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	90835233.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.949871+00	2025-08-18 02:55:14.949871+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
2a130244-b3f6-4edd-b3e6-d3f17c4e386f	Acme Corporation	https://acme.com	acme.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	85000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.84109+00	2025-08-18 14:22:23.84109+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
4774668c-86f8-47cf-b14d-9812528d4174	Global Tech Solutions	https://globaltech.com	globaltech.com	bd53cb65-5771-469f-8a74-3c843566505b	04ac49c0-e454-4b18-b5df-10469daaab30	250000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.886258+00	2025-08-18 14:22:23.886258+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
215d54e5-9d5b-4afd-8491-6e6d627b29e2	Meridian Healthcare	https://meridianhealth.com	meridianhealth.com	c94caae6-5d0c-449e-939d-58ef35462ddb	77677d26-f561-4632-8487-14b177da9858	180000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.921121+00	2025-08-18 14:22:23.921121+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
7e2eaea8-3dbb-46f4-a4f1-f6fa806ad4b9	Summit Financial Group	https://summitfinancial.com	summitfinancial.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	450000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.952835+00	2025-08-18 14:22:23.952835+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
25365980-21fe-4da6-a1c8-2276fcc5510c	Precision Manufacturing Co	https://precisionmfg.com	precisionmfg.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	77677d26-f561-4632-8487-14b177da9858	120000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.987171+00	2025-08-18 14:22:23.987171+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
74b78071-20e8-4771-ac54-0b2972cac756	Urban Retail Partners	https://urbanretail.com	urbanretail.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	75000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.020582+00	2025-08-18 14:22:24.020582+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
5ec46438-0ab7-4d27-81c4-1c59a869ae20	Nexus Consulting	https://nexusconsulting.com	nexusconsulting.com	bd53cb65-5771-469f-8a74-3c843566505b	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	25000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.029578+00	2025-08-18 14:22:24.029578+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
b8a09f47-b6dc-4d26-b0dc-d3104966cb47	Blue Horizon Energy	https://bluehorizon.com	bluehorizon.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	77677d26-f561-4632-8487-14b177da9858	300000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.041393+00	2025-08-18 14:22:24.041393+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
46d2fb0a-b266-4519-b5d2-24ee89607cdc	Silver Lining Insurance	https://silverlining.com	silverlining.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	536bf6db-1ba6-4549-ad8c-687095c5e195	95000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.075681+00	2025-08-18 14:22:24.075681+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
276a631e-5c76-4110-a21d-6a565caf3a5b	Green Earth Solutions	https://greenearth.com	greenearth.com	bd53cb65-5771-469f-8a74-3c843566505b	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	15000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.087316+00	2025-08-18 14:22:24.087316+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Active	Medium	\N	\N	\N
\.


--
-- Data for Name: company_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_sizes (id, name, code, description, min_employees, max_employees, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
d3c32cd9-c5d6-4eae-8232-7ac769f3a197	1-10 employees	SMALL	\N	1	10	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.175409+00	2025-08-14 10:06:11.175409+00	\N
536bf6db-1ba6-4549-ad8c-687095c5e195	11-50 employees	MEDIUM	\N	11	50	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.178617+00	2025-08-14 10:06:11.178617+00	\N
77677d26-f561-4632-8487-14b177da9858	51-200 employees	LARGE	\N	51	200	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.182189+00	2025-08-14 10:06:11.182189+00	\N
04ac49c0-e454-4b18-b5df-10469daaab30	201+ employees	ENTERPRISE	\N	201	\N	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.185243+00	2025-08-14 10:06:11.185243+00	\N
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, first_name, last_name, title, department, company_id, original_source, email_opt_in, sms_opt_in, call_opt_in, tenant_id, created_at, updated_at, created_by, deleted_at, owner_id) FROM stdin;
7eed624f-9925-4f80-9146-ae820be0e58f	Sarah	Johnson	Chief Executive Officer	Executive	2a130244-b3f6-4edd-b3e6-d3f17c4e386f	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.852282+00	2025-08-18 14:22:23.852282+00	\N	\N	\N
48434ee4-b741-492a-81f3-91519de02819	Alex	Turner	Marketing Director	Marketing	2a130244-b3f6-4edd-b3e6-d3f17c4e386f	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.861228+00	2025-08-18 14:22:23.861228+00	\N	\N	\N
a524b0ac-d7ab-4a84-a018-1b9da0151d15	Maria	Gonzalez	HR Manager	Human Resources	2a130244-b3f6-4edd-b3e6-d3f17c4e386f	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.870296+00	2025-08-18 14:22:23.870296+00	\N	\N	\N
0df6cdfd-8f89-45ec-97c1-8a064eb59d7a	Daniel	Kim	Product Manager	Product	2a130244-b3f6-4edd-b3e6-d3f17c4e386f	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.877688+00	2025-08-18 14:22:23.877688+00	\N	\N	\N
3e27031f-244c-43fd-b56e-257693adfa93	Michael	Chen	Chief Technology Officer	Technology	4774668c-86f8-47cf-b14d-9812528d4174	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.89021+00	2025-08-18 14:22:23.89021+00	\N	\N	\N
09e37143-1951-4511-8f1f-3aac3bad777e	Alex	Turner	Marketing Director	Marketing	4774668c-86f8-47cf-b14d-9812528d4174	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.899148+00	2025-08-18 14:22:23.899148+00	\N	\N	\N
75a13a2a-9045-490e-a359-b597bf5aee59	Maria	Gonzalez	HR Manager	Human Resources	4774668c-86f8-47cf-b14d-9812528d4174	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.907194+00	2025-08-18 14:22:23.907194+00	\N	\N	\N
9c5f4ad2-4e14-4869-bb4c-fcefbf412421	Daniel	Kim	Product Manager	Product	4774668c-86f8-47cf-b14d-9812528d4174	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.91345+00	2025-08-18 14:22:23.91345+00	\N	\N	\N
f621f36e-7519-4b45-9722-f6afb1e1b2d4	Emily	Rodriguez	Chief Medical Officer	Medical	215d54e5-9d5b-4afd-8491-6e6d627b29e2	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.924227+00	2025-08-18 14:22:23.924227+00	\N	\N	\N
e5c1ea2b-953d-4a36-9259-2d9f67990727	Alex	Turner	Marketing Director	Marketing	215d54e5-9d5b-4afd-8491-6e6d627b29e2	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.930413+00	2025-08-18 14:22:23.930413+00	\N	\N	\N
06a27fba-d6d1-4181-a8e6-504ccb8c18dd	Maria	Gonzalez	HR Manager	Human Resources	215d54e5-9d5b-4afd-8491-6e6d627b29e2	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.939217+00	2025-08-18 14:22:23.939217+00	\N	\N	\N
2fa04312-6fdf-48ef-b97b-4140d71aa371	Daniel	Kim	Product Manager	Product	215d54e5-9d5b-4afd-8491-6e6d627b29e2	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.945449+00	2025-08-18 14:22:23.945449+00	\N	\N	\N
0aa76ff6-c0ff-42be-aba5-dc6675822269	David	Thompson	Chief Financial Officer	Finance	7e2eaea8-3dbb-46f4-a4f1-f6fa806ad4b9	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.956283+00	2025-08-18 14:22:23.956283+00	\N	\N	\N
020f0aea-f3e4-440c-a460-e07a253a213f	Alex	Turner	Marketing Director	Marketing	7e2eaea8-3dbb-46f4-a4f1-f6fa806ad4b9	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.962219+00	2025-08-18 14:22:23.962219+00	\N	\N	\N
c208a55d-bcfb-4722-b5f6-b3d734b55fda	Maria	Gonzalez	HR Manager	Human Resources	7e2eaea8-3dbb-46f4-a4f1-f6fa806ad4b9	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.969892+00	2025-08-18 14:22:23.969892+00	\N	\N	\N
4662ccd3-31b9-4af0-9a95-451120024bb8	Daniel	Kim	Product Manager	Product	7e2eaea8-3dbb-46f4-a4f1-f6fa806ad4b9	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.978261+00	2025-08-18 14:22:23.978261+00	\N	\N	\N
81c00860-f07b-4d75-a3fc-06c4d811151f	Lisa	Wang	Operations Director	Operations	25365980-21fe-4da6-a1c8-2276fcc5510c	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.990341+00	2025-08-18 14:22:23.990341+00	\N	\N	\N
e0bc6b84-16f9-4c0c-9b6e-686b5f97bde3	Alex	Turner	Marketing Director	Marketing	25365980-21fe-4da6-a1c8-2276fcc5510c	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.996632+00	2025-08-18 14:22:23.996632+00	\N	\N	\N
7b58e1a4-a308-4c03-945a-638be63fd87f	Maria	Gonzalez	HR Manager	Human Resources	25365980-21fe-4da6-a1c8-2276fcc5510c	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.006052+00	2025-08-18 14:22:24.006052+00	\N	\N	\N
f2226b9e-de07-44ea-a765-44d296f9eac6	Daniel	Kim	Product Manager	Product	25365980-21fe-4da6-a1c8-2276fcc5510c	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.012234+00	2025-08-18 14:22:24.012234+00	\N	\N	\N
b184b112-eb53-484d-ac9d-b02e9b731845	James	Wilson	Retail Manager	Sales	74b78071-20e8-4771-ac54-0b2972cac756	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.023761+00	2025-08-18 14:22:24.023761+00	\N	\N	\N
2b1b3817-65a1-4899-b31e-cc4a16a1569d	Jennifer	Davis	Senior Consultant	Consulting	5ec46438-0ab7-4d27-81c4-1c59a869ae20	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.034594+00	2025-08-18 14:22:24.034594+00	\N	\N	\N
0ac551ec-5265-40ba-bb3e-089488d0f3ff	Robert	Brown	Energy Director	Energy	b8a09f47-b6dc-4d26-b0dc-d3104966cb47	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.043994+00	2025-08-18 14:22:24.043994+00	\N	\N	\N
c0d318cd-d5ae-4e16-ad0c-bfe6058d12e0	Alex	Turner	Marketing Director	Marketing	b8a09f47-b6dc-4d26-b0dc-d3104966cb47	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.052501+00	2025-08-18 14:22:24.052501+00	\N	\N	\N
2a202130-6cc6-433b-a6f6-b03191c6c6bc	Maria	Gonzalez	HR Manager	Human Resources	b8a09f47-b6dc-4d26-b0dc-d3104966cb47	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.059925+00	2025-08-18 14:22:24.059925+00	\N	\N	\N
ecfb1de9-991e-4e5d-bce1-482f0aa7333a	Daniel	Kim	Product Manager	Product	b8a09f47-b6dc-4d26-b0dc-d3104966cb47	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.069267+00	2025-08-18 14:22:24.069267+00	\N	\N	\N
4f618057-25ed-4470-874d-7aa321803990	Amanda	Garcia	Claims Manager	Claims	46d2fb0a-b266-4519-b5d2-24ee89607cdc	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.078664+00	2025-08-18 14:22:24.078664+00	\N	\N	\N
ebd8f8ff-535f-4198-b946-38862419a922	Christopher	Lee	Sustainability Manager	Sustainability	276a631e-5c76-4110-a21d-6a565caf3a5b	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.089986+00	2025-08-18 14:22:24.089986+00	\N	\N	\N
0bf8c763-2842-49b2-b0e9-4a26ec1735c4	John	Smith	CEO	Executive	e124301d-e9af-42c1-a361-0c0882547f7a	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:01:07.841703+00	2025-08-15 07:01:07.841703+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
79644c52-cd25-4489-800c-04a89d7a7861	Sarah	Johnson	Sales Manager	Sales	e124301d-e9af-42c1-a361-0c0882547f7a	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:01:07.847391+00	2025-08-15 07:01:07.847391+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
39ffe7b8-133f-4c18-82c4-6a6d9163f5e4	Sarah	Johnson	Chief Technology Officer	Technology	b5de6862-01e7-4e04-a831-3dfe95563c9c	Website Contact Form	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.535874+00	2025-08-15 08:10:15.535874+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
c835bac7-9ab5-4fc6-97a2-81d8d91b908a	Michael	Chen	Senior Software Engineer	Engineering	b5de6862-01e7-4e04-a831-3dfe95563c9c	LinkedIn	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.538311+00	2025-08-15 08:10:15.538311+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
45582b4d-b0e3-48e4-b8e3-958de0648580	Dr. Emily	Rodriguez	Medical Director	Medical	7d89c2bd-9fd9-4bf2-b5f9-644e244afe65	Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.540205+00	2025-08-15 08:10:15.540205+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
d612c904-77a1-42e9-8e0b-71ba452fa196	David	Thompson	Chief Financial Officer	Finance	6b2e822a-b5c8-480d-ac5e-7a3e0ec78e98	Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.541968+00	2025-08-15 08:10:15.541968+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
d6409070-9d3f-4474-a3ff-fff2adbf0e42	Lisa	Wang	Investment Manager	Investment	6b2e822a-b5c8-480d-ac5e-7a3e0ec78e98	Cold Outreach	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.544082+00	2025-08-15 08:10:15.544082+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
a42da5d5-9f01-4225-b45a-d6dac56f3fe5	Robert	Anderson	Operations Manager	Operations	8152c747-c080-46cb-86a4-730ef9e79f7b	Trade Show	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.546268+00	2025-08-15 08:10:15.546268+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
2e2350ec-2863-41d0-bea7-210e82e5dafa	Jennifer	Martinez	Quality Control Specialist	Quality Assurance	8152c747-c080-46cb-86a4-730ef9e79f7b	Job Board	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.548371+00	2025-08-15 08:10:15.548371+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
898e3e0c-3be0-4f87-9f62-9157c2e70a3d	James	Wilson	Store Manager	Retail	cc5c3527-dc17-48b7-830e-c24d5378861a	Direct Contact	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.550228+00	2025-08-15 08:10:15.550228+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
0437461a-1672-4eee-ad3a-af42eae66a89	Amanda	Taylor	Marketing Director	Marketing	b5de6862-01e7-4e04-a831-3dfe95563c9c	Social Media	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.552355+00	2025-08-15 08:10:15.552355+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
df3c4ded-67fa-4cc2-8f04-f8a7d91e41f6	Christopher	Brown	Product Manager	Product	b5de6862-01e7-4e04-a831-3dfe95563c9c	Employee Referral	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.554752+00	2025-08-15 08:10:15.554752+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
f14577df-3f7b-4df5-93e4-1091ca3d8cdf	Maria	Garcia	Nurse Practitioner	Nursing	7d89c2bd-9fd9-4bf2-b5f9-644e244afe65	Professional Network	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.557292+00	2025-08-15 08:10:15.557292+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
c2541b4e-5ea0-4e78-8bfb-b1d801ca1f3b	Kevin	Lee	Risk Analyst	Risk Management	6b2e822a-b5c8-480d-ac5e-7a3e0ec78e98	Industry Event	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.559785+00	2025-08-15 08:10:15.559785+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
090c8640-8c9f-4fbc-a0c7-7cb0691f1f71	Rachel	Davis	Supply Chain Coordinator	Supply Chain	8152c747-c080-46cb-86a4-730ef9e79f7b	Supplier Database	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.562056+00	2025-08-15 08:10:15.562056+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
44802c21-4411-42de-ac6d-4026dc903cf5	Thomas	Miller	Assistant Manager	Retail	cc5c3527-dc17-48b7-830e-c24d5378861a	Internal Promotion	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.565933+00	2025-08-15 08:10:15.565933+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
fe86be0d-4c6e-4a05-b069-4d3b5ecec67d	Nicole	White	UX Designer	Design	b5de6862-01e7-4e04-a831-3dfe95563c9c	Portfolio Website	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.568549+00	2025-08-15 08:10:15.568549+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
e07c45ab-86f7-4bc1-9791-64f470254f1b	Daniel	Clark	DevOps Engineer	Engineering	b5de6862-01e7-4e04-a831-3dfe95563c9c	GitHub Profile	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.570481+00	2025-08-15 08:10:15.570481+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
2565104e-5573-49f8-b4dc-45373ef0982f	Stephanie	Lewis	Physician Assistant	Medical	7d89c2bd-9fd9-4bf2-b5f9-644e244afe65	Medical Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.572461+00	2025-08-15 08:10:15.572461+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
af50ec3f-7d3d-473f-ae9f-c18554eb1043	Andrew	Hall	Compliance Officer	Compliance	6b2e822a-b5c8-480d-ac5e-7a3e0ec78e98	Regulatory Contact	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.574335+00	2025-08-15 08:10:15.574335+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
90ac4fe8-2cf9-4d75-be83-1ef8d753e9a6	Jessica	Allen	Production Supervisor	Production	8152c747-c080-46cb-86a4-730ef9e79f7b	Manufacturing Expo	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.576173+00	2025-08-15 08:10:15.576173+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
4a5649ec-3678-4185-adbd-1b6783e54b1b	Ryan	Young	Sales Associate	Sales	cc5c3527-dc17-48b7-830e-c24d5378861a	Walk-in Application	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.578956+00	2025-08-15 08:10:15.578956+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
1899a533-5d7b-4e0c-acde-5a26d519f8fb	Michael	Chen	Senior Software Engineer	Engineering	30d8b0b0-2d20-427f-a456-f261f662ba99	LinkedIn	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.534999+00	2025-08-15 08:11:07.534999+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
b7c18cc6-85ac-4800-905f-6e06009b2faa	Dr. Emily	Rodriguez	Medical Director	Medical	82394f79-e8ee-41c9-94bf-1ff2acad6975	Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.536901+00	2025-08-15 08:11:07.536901+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
12009684-90ba-48ac-aaff-68b85898b876	David	Thompson	Chief Financial Officer	Finance	91ebf292-9cfc-494d-957e-ee34f9137fec	Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.538721+00	2025-08-15 08:11:07.538721+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
65f26e41-b1d2-42a4-b865-0184d0a253ef	Lisa	Wang	Investment Manager	Investment	91ebf292-9cfc-494d-957e-ee34f9137fec	Cold Outreach	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.540543+00	2025-08-15 08:11:07.540543+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
51d57c02-0cad-43ab-b5f5-b3fa6876ded7	Robert	Anderson	Operations Manager	Operations	570512eb-aabf-42b9-b485-3df0effee807	Trade Show	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.543085+00	2025-08-15 08:11:07.543085+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
cbe1e31a-58ad-4ca5-9885-aaa5cc8caa7a	James	Wilson	Store Manager	Retail	af5e910f-9054-4c3f-b509-c3815aaade72	Direct Contact	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.549429+00	2025-08-15 08:11:07.549429+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
a8989009-ddeb-4db9-9ca3-5d5a73c3f157	Amanda	Taylor	Marketing Director	Marketing	30d8b0b0-2d20-427f-a456-f261f662ba99	Social Media	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.551718+00	2025-08-15 08:11:07.551718+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
16646396-7e65-44e9-aa52-7c9d48c0bd5c	Christopher	Brown	Product Manager	Product	30d8b0b0-2d20-427f-a456-f261f662ba99	Employee Referral	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.553428+00	2025-08-15 08:11:07.553428+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
1ff11a34-e708-42b5-81ee-01e384807c37	Jennifer	Martinez	Quality Control Specialist	Quality Assurance	570512eb-aabf-42b9-b485-3df0effee807	Job Board	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.546841+00	2025-08-15 08:11:07.546841+00	\N	2025-08-17 18:26:03.99125+00	0f4062f4-cde1-4a4e-83e4-2be22f02368b
37d15eca-8c95-4288-a9aa-1de9953d6192	Sarah	Johnson	Chief Technology Officer	Technology	30d8b0b0-2d20-427f-a456-f261f662ba99	Website Contact Form	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.532188+00	2025-08-15 08:11:07.532188+00	\N	2025-08-17 18:26:03.78191+00	0f4062f4-cde1-4a4e-83e4-2be22f02368b
80a691c5-750a-4b85-a070-956fbb0bcc12	Tee	Higgens	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	\N	ba774a5b-22b2-4766-b985-97548b2380dc
26989bab-7b6a-46c0-bf60-daf49dd2fe30	Be	Le	manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	\N	ba774a5b-22b2-4766-b985-97548b2380dc
f1e484dd-8615-409f-9b01-6e536f9909a3	SF Steve	Finch	CEO	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	ba774a5b-22b2-4766-b985-97548b2380dc
e6f54401-17c5-4f5c-9297-fa04b64244ce	Steve	Finch	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	ba774a5b-22b2-4766-b985-97548b2380dc
b5d95210-8c01-4eb2-bec2-ced705e9c90a	Anthony	Hill	Logistics Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	ba774a5b-22b2-4766-b985-97548b2380dc
923d50f0-1533-41b8-af8d-c1a8eb65212b	Helen	Lopez	Logistics Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	ba774a5b-22b2-4766-b985-97548b2380dc
8a7daa72-e559-4426-afd1-3eee65a6ec99	Kevin	Gonzalez	VP of Sales	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	ba774a5b-22b2-4766-b985-97548b2380dc
f6a1f81b-e0b6-4d7f-a39b-0b9d701b5006	Lisa	Harris	Software Engineer	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	ba774a5b-22b2-4766-b985-97548b2380dc
1c682b6d-deb0-4f45-b6f5-7fa15e022d6a	Lauren	Lopez	Risk Analyst	Investment	233915d4-3561-4a96-b8f4-539aee58d54a	Partner Referral	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.485453+00	2025-08-17 16:27:08.485453+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
d8447d3f-b609-4082-8465-a011f51df931	Joshua	Hill	Compliance Officer	Medical	08d8f3c1-53ff-4445-9832-a1b02b3e0a98	Alumni Network	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.48727+00	2025-08-17 16:27:08.48727+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
930ee9a5-7dc6-4c0e-aaa2-2ff6e58600a5	Megan	Scott	Production Supervisor	Nursing	4ccc9467-319f-468b-9b6a-ce29a5195ed6	Professional Association	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.489033+00	2025-08-17 16:27:08.489033+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
f980c170-c4ff-43bc-8a6e-1ffccdfc71e7	Justin	Green	Investment Manager	Retail	f95d5433-17a8-4a25-8a87-dfad8ac5793d	Online Directory	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.490839+00	2025-08-17 16:27:08.490839+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
26a14cfc-424f-42fc-98b0-ca7ddc12563b	Hannah	Adams	Medical Director	Administration	c920fe2a-7619-46cf-80cd-18d08eceba2b	Press Release	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.493414+00	2025-08-17 16:27:08.493414+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
34e3d58a-7972-48bc-9763-70f81fff7047	Brandon	Baker	Nurse Practitioner	Strategy	1de20cb2-4b55-4a4d-9eba-f10e78c4e09f	Trade Publication	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.49541+00	2025-08-17 16:27:08.49541+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
75841c1e-be55-4f91-8b2a-285ee3e2c95e	Maria	Garcia	Nurse Practitioner	Nursing	82394f79-e8ee-41c9-94bf-1ff2acad6975	Professional Network	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.555185+00	2025-08-15 08:11:07.555185+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
80b478c6-a136-41aa-a775-dd6f13b35ce5	Sarah	Johnson	Chief Technology Officer	Technology	e8849080-2368-478d-b4ce-b87ebd7974b2	Website Contact Form	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.943247+00	2025-08-15 08:14:15.943247+00	\N	2025-08-17 18:26:03.792159+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
71835f3c-a952-45c4-8b44-1b5dc86f560b	Sarah	Johnson	Chief Executive Officer	Executive	ec4f7848-824e-4fb6-9551-ea1473dcfb3f	Website Contact Form	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.201753+00	2025-08-15 08:22:51.201753+00	\N	2025-08-17 18:26:03.80058+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
fcac580b-cd52-419a-8405-553af02cc7b9	Amanda	Taylor	Marketing Director	Marketing	e8849080-2368-478d-b4ce-b87ebd7974b2	Social Media	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.959275+00	2025-08-15 08:14:15.959275+00	\N	2025-08-17 18:26:03.818652+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
ec29c855-9934-4651-8371-a0d5c9e2163b	Amanda	Taylor	Marketing Manager	Human Resources	a8eb5b3c-2efc-40f7-b64b-e05ce198507d	Social Media	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.926277+00	2025-08-15 08:22:52.926277+00	\N	2025-08-17 18:26:03.826439+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
67fe5163-840d-40d0-a47a-0e47eef3aa1f	Christopher	Brown	Product Manager	Product	e8849080-2368-478d-b4ce-b87ebd7974b2	Employee Referral	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.961064+00	2025-08-15 08:14:15.961064+00	\N	2025-08-17 18:26:03.852276+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
5d7d50df-1571-41b9-bb02-491410333086	Kevin	Lee	Risk Analyst	Risk Management	50ea3d2c-f3e3-4460-ad34-49bdb87a325a	Industry Event	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.964704+00	2025-08-15 08:14:15.964704+00	\N	2025-08-17 18:26:03.862305+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
f356d20c-0eca-4927-ae55-e346e8d3bef2	Kevin	Lee	Quality Assurance Specialist	Project Management	ea6652d1-dbd5-4bee-a831-60b6aacd706a	Industry Event	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.935689+00	2025-08-15 08:22:52.935689+00	\N	2025-08-17 18:26:03.872856+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
e78f2b83-0484-4afb-8455-c9ab83d3ac24	Thomas	Miller	Assistant Manager	Retail	d6d87d98-9660-4cfc-85c0-2e2df0ebe0e9	Internal Promotion	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.969841+00	2025-08-15 08:14:15.969841+00	\N	2025-08-17 18:26:03.893477+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
a8442327-27cb-4100-a075-266024a6fa31	Andrew	Hall	Compliance Officer	Compliance	50ea3d2c-f3e3-4460-ad34-49bdb87a325a	Regulatory Contact	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.977434+00	2025-08-15 08:14:15.977434+00	\N	2025-08-17 18:26:03.926336+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
b512eb23-5cc9-4ff7-8f8c-933296223613	Andrew	Hall	Financial Analyst	Research & Development	7c7644ee-cb23-4dfb-8ed5-39edae86c278	Regulatory Contact	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.951624+00	2025-08-15 08:22:52.951624+00	\N	2025-08-17 18:26:03.938264+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
f48aefee-a57e-4d26-8b5f-30baba3066d5	Stephanie	Lewis	Physician Assistant	Medical	e23a12d3-3380-4918-ac31-39bfe80a8211	Medical Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.97578+00	2025-08-15 08:14:15.97578+00	\N	2025-08-17 18:26:03.960059+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
42fb3edb-a559-45cf-a8ea-250c63e42cad	Stephanie	Lewis	DevOps Engineer	Customer Success	ca85637b-3852-444f-af3f-a42b032191be	Medical Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.949336+00	2025-08-15 08:22:52.949336+00	\N	2025-08-17 18:26:03.968693+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
9162abfc-b74e-43a6-a298-22a68ad467f1	Jennifer	Martinez	Quality Control Specialist	Quality Assurance	04ba9ed7-7b34-4442-9fae-6367d79481cf	Job Board	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.955668+00	2025-08-15 08:14:15.955668+00	\N	2025-08-17 18:26:04.001836+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
1c904267-3176-4629-9cb3-5b439e86d2f1	Jennifer	Martinez	Product Manager	Product	a438d48a-ee50-448e-852e-7a7d4d5c704b	Job Board	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.922134+00	2025-08-15 08:22:52.922134+00	\N	2025-08-17 18:26:04.011791+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
459af641-3c9f-49f3-98db-94aec533473f	Maria	Garcia	Nurse Practitioner	Nursing	e23a12d3-3380-4918-ac31-39bfe80a8211	Professional Network	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.962724+00	2025-08-15 08:14:15.962724+00	\N	2025-08-17 18:26:04.037357+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
9bdc5448-84e3-4712-9324-021b0d9b2baf	Maria	Garcia	Operations Manager	Business Development	63ac9507-3b40-4410-96f6-deaf949d8aa9	Professional Network	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.933075+00	2025-08-15 08:22:52.933075+00	\N	2025-08-17 18:26:04.045707+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
4c9e0078-844e-4256-a5ba-6219640da299	Jessica	Allen	Production Supervisor	Production	04ba9ed7-7b34-4442-9fae-6367d79481cf	Manufacturing Expo	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.979134+00	2025-08-15 08:14:15.979134+00	\N	2025-08-17 18:26:04.068436+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
d4c992d0-ad35-450e-b645-562ab2dc1f97	David	Thompson	Chief Financial Officer	Finance	50ea3d2c-f3e3-4460-ad34-49bdb87a325a	Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.9492+00	2025-08-15 08:14:15.9492+00	\N	2025-08-17 18:26:04.21513+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
6b59a3e9-a1ee-47a0-9a5f-80e652670dea	David	Thompson	Chief Marketing Officer	Marketing	6c1effb0-40d8-4e3c-ad9a-1a80f7371bf6	Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.21205+00	2025-08-15 08:22:51.21205+00	\N	2025-08-17 18:26:04.226291+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
417ce8f7-494c-43bc-b861-b8589cbed058	Michael	Chen	Senior Software Engineer	Engineering	e8849080-2368-478d-b4ce-b87ebd7974b2	LinkedIn	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.945453+00	2025-08-15 08:14:15.945453+00	\N	2025-08-17 18:26:04.268372+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
cbbb439a-9f16-4fa3-ba75-4d1dc68a7134	Michael	Chen	Chief Technology Officer	Technology	ca85637b-3852-444f-af3f-a42b032191be	LinkedIn	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.205596+00	2025-08-15 08:22:51.205596+00	\N	2025-08-17 18:26:04.278056+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
0a6b9b0c-47cc-44d1-9fd6-fe346808bb39	Dr. Emily	Rodriguez	Medical Director	Medical	e23a12d3-3380-4918-ac31-39bfe80a8211	Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.947335+00	2025-08-15 08:14:15.947335+00	\N	2025-08-17 18:26:04.329276+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
fecc7990-5a41-4a7b-bfe3-ef3341e271f0	Lisa	Wang	Chief Operating Officer	Operations	9dc9056f-a165-4002-a9a6-552dd5305f7a	Cold Outreach	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.911538+00	2025-08-15 08:22:52.911538+00	\N	2025-08-17 18:26:04.355303+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
9a9a12c0-64c4-4b7a-97fd-198516544dce	Rachel	Davis	Supply Chain Coordinator	Supply Chain	04ba9ed7-7b34-4442-9fae-6367d79481cf	Supplier Database	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.967232+00	2025-08-15 08:14:15.967232+00	\N	2025-08-17 18:26:04.380861+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
00eee6b8-7fba-43f5-8f53-f973673860d5	Rachel	Davis	Business Analyst	Data Science	be65e1b5-8ce7-4426-b5f8-1625321a854c	Supplier Database	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.938101+00	2025-08-15 08:22:52.938101+00	\N	2025-08-17 18:26:04.39425+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
d42d64c8-e5d2-4968-81fb-92a3eee42c7d	Ryan	Young	Customer Success Manager	Risk Management	9dc9056f-a165-4002-a9a6-552dd5305f7a	Walk-in Application	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.956263+00	2025-08-15 08:22:52.956263+00	\N	2025-08-17 18:26:03.652367+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
37859bd5-9289-416e-a9c9-039e160c03bb	Daniel	Clark	DevOps Engineer	Engineering	e8849080-2368-478d-b4ce-b87ebd7974b2	GitHub Profile	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.974078+00	2025-08-15 08:14:15.974078+00	\N	2025-08-17 18:26:03.683379+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
4eaeaf67-5f8a-406d-a3ee-50619aa8a58e	Thomas	Miller	Project Manager	Design	a3933216-7f83-41aa-953a-c805b5c47789	Internal Promotion	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.940249+00	2025-08-15 08:22:52.940249+00	\N	2025-08-17 18:26:03.901925+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
6fbf1379-a38e-4245-ad81-91ab4ac8af69	Lisa	Wang	Investment Manager	Investment	50ea3d2c-f3e3-4460-ad34-49bdb87a325a	Cold Outreach	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.951011+00	2025-08-15 08:14:15.951011+00	\N	2025-08-17 18:26:04.340398+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
3931d0ed-21f3-4c42-9c46-9d109fb49efe	Kayla	Gonzalez	Physician Assistant	Communications	6d8cd793-a016-4ab7-9b39-b65b6aaecd0e	Award Ceremony	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.497406+00	2025-08-17 16:27:08.497406+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
222a3bcf-c11d-4357-af01-e73a23bfe2fb	Tyler	Nelson	Store Manager	Public Relations	c2c99d42-6aab-4af6-9f5f-1c9833d34799	Charity Event	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.499443+00	2025-08-17 16:27:08.499443+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
ba177b04-db10-4ecf-ac88-5420d22d6a24	Alexandra	Carter	Assistant Manager	Brand Management	35b59ce3-077f-4ea3-b57d-afc7b50e6613	University Career Fair	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.501317+00	2025-08-17 16:27:08.501317+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
aa802da1-5d54-4fae-a6e5-b34cf705cbb6	Zachary	Mitchell	Sales Associate	Accounting	64c5858d-837d-4ad3-9878-cf5d29e7dd56	Industry Conference	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.503106+00	2025-08-17 16:27:08.503106+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
85eae53c-da16-4325-af27-990fa897ef7c	Victoria	Perez	Marketing Specialist	Tax	01be7874-0098-4ec5-9d48-9393ca57bc98	Client Referral	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.504972+00	2025-08-17 16:27:08.504972+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
8b644611-c702-4925-840e-f9fcb2d7e49e	Mark	Morgan	Auditor	Data Science	01be7874-0098-4ec5-9d48-9393ca57bc98	Speaking Engagement	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.535243+00	2025-08-17 16:27:08.535243+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
a3694834-ba15-417f-bc5f-f0ef8f32829a	Tiffany	Bell	Investment Analyst	Design	a94483dd-5541-4a47-a4ff-7fca34c3c0dc	Website Contact Form	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.537662+00	2025-08-17 16:27:08.537662+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
e9b09322-628a-43e7-8c24-47eeb0242ccb	Brian	Murphy	Portfolio Manager	DevOps	1f8f16a7-3562-4df8-bbdc-a0e4b6e14cee	LinkedIn	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.539709+00	2025-08-17 16:27:08.539709+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
c8e1aca8-fb2c-49c7-a0c8-096f4fca6c9b	Ryan	Young	Customer Success Manager	Risk Management	1f8f16a7-3562-4df8-bbdc-a0e4b6e14cee	Walk-in Application	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.479251+00	2025-08-17 16:27:08.479251+00	\N	2025-08-17 18:26:03.672412+00	ba774a5b-22b2-4766-b985-97548b2380dc
f73af282-1e7c-4aff-a1f8-00cb2ac85f75	Matthew	Wright	Supply Chain Coordinator	Production	a438d48a-ee50-448e-852e-7a7d4d5c704b	Webinar	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.964295+00	2025-08-15 08:22:52.964295+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
46329ca7-07e6-4e20-ae38-de578a8a17ec	Amber	Collins	Content Strategist	Engineering	63ac9507-3b40-4410-96f6-deaf949d8aa9	Paid Search	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.021224+00	2025-08-15 08:22:53.021224+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
81d7b663-6309-4c6a-9b15-df2116603e7c	Timothy	Stewart	Social Media Manager	Product	ea6652d1-dbd5-4bee-a831-60b6aacd706a	Display Advertising	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.023574+00	2025-08-15 08:22:53.023574+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
2f1441fd-04b9-4d61-bcb0-b9e70e01d17a	Danielle	Sanchez	Event Coordinator	Sales	be65e1b5-8ce7-4426-b5f8-1625321a854c	Retargeting	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.02638+00	2025-08-15 08:22:53.02638+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
2d009c16-2efc-4aff-969b-3ffdcd889455	Kyle	Morris	Public Relations Manager	Human Resources	a3933216-7f83-41aa-953a-c805b5c47789	Affiliate Marketing	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.030229+00	2025-08-15 08:22:53.030229+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
b16af43d-4eca-42ae-88d0-b226bc972b45	Brittany	Rogers	Brand Manager	Quality Assurance	cfca2e1f-8426-47f9-b582-07400862bd4c	Influencer Partnership	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.033031+00	2025-08-15 08:22:53.033031+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
bf1250e4-f880-49cf-8922-c58160f1c54a	Jeffrey	Reed	Financial Controller	Business Development	ec4f7848-824e-4fb6-9551-ea1473dcfb3f	Podcast Interview	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.035486+00	2025-08-15 08:22:53.035486+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
3d217f34-7bf3-495e-a7cf-c5b86460e720	Courtney	Cook	Tax Specialist	Project Management	ca85637b-3852-444f-af3f-a42b032191be	Guest Blog Post	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.037714+00	2025-08-15 08:22:53.037714+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
487a22b0-19c8-4cce-82bf-b3aba6d573b4	Mark	Morgan	Auditor	Data Science	7c7644ee-cb23-4dfb-8ed5-39edae86c278	Speaking Engagement	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.040164+00	2025-08-15 08:22:53.040164+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
3c776a84-690f-49b4-9b92-a7b0b05bf02c	Tiffany	Bell	Investment Analyst	Design	6c1effb0-40d8-4e3c-ad9a-1a80f7371bf6	Website Contact Form	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.04227+00	2025-08-15 08:22:53.04227+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
048fb772-8d84-4a5a-a041-b53e813ad11d	Brian	Murphy	Portfolio Manager	DevOps	9dc9056f-a165-4002-a9a6-552dd5305f7a	LinkedIn	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.044609+00	2025-08-15 08:22:53.044609+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
817f740e-6756-43f8-b62c-546be5e1264f	John	Doe	\N	\N	e124301d-e9af-42c1-a361-0c0882547f7a	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-16 14:03:50.360242+00	2025-08-16 14:03:50.360242+00		\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
1651b848-eaf2-45e4-9c8a-b86f5d9cf9b9	Jane	Smith	\N	\N	e124301d-e9af-42c1-a361-0c0882547f7a	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-16 14:09:37.790159+00	2025-08-16 14:09:37.790159+00		\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
b9f04d97-3de9-4904-abfc-02da289b36c3	Emily	Rodriguez	Chief Financial Officer	Finance	01be7874-0098-4ec5-9d48-9393ca57bc98	Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.440262+00	2025-08-17 16:27:08.440262+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
f3b9674b-6d74-44fc-8e45-d211e690bbbe	Christopher	Wilson	Sales Director	Sales	233915d4-3561-4a96-b8f4-539aee58d54a	Direct Contact	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.451481+00	2025-08-17 16:27:08.451481+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
cb7bd4d2-dd4f-4f3e-ac59-0a62a347c699	James	Brown	Human Resources Director	Quality Assurance	4ccc9467-319f-468b-9b6a-ce29a5195ed6	Employee Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.455833+00	2025-08-17 16:27:08.455833+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
872ea1a8-3bfd-4e07-804e-12cc98a7ebc7	Kevin	Lee	Quality Assurance Specialist	Project Management	c920fe2a-7619-46cf-80cd-18d08eceba2b	Industry Event	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.460355+00	2025-08-17 16:27:08.460355+00	\N	2025-08-17 18:26:03.885038+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
aefa7bf8-162c-485d-8c3b-0171ace0f395	Thomas	Miller	Project Manager	Design	6d8cd793-a016-4ab7-9b39-b65b6aaecd0e	Internal Promotion	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.465286+00	2025-08-17 16:27:08.465286+00	\N	2025-08-17 18:26:03.913986+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
0d5ed291-0e8a-4684-a922-2d8c8935b7ad	Stephanie	Lewis	DevOps Engineer	Customer Success	64c5858d-837d-4ad3-9878-cf5d29e7dd56	Medical Conference	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.473034+00	2025-08-17 16:27:08.473034+00	\N	2025-08-17 18:26:03.981273+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
3ca06c04-df2c-409b-bd34-7b27338313c9	Jennifer	Martinez	Product Manager	Product	88463116-9630-499e-8ae9-76aeacf2851f	Job Board	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.449355+00	2025-08-17 16:27:08.449355+00	\N	2025-08-17 18:26:04.026471+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
f4d9034c-0c88-4963-a5ff-d9ab1d4968e5	Maria	Garcia	Operations Manager	Business Development	f95d5433-17a8-4a25-8a87-dfad8ac5793d	Professional Network	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.457724+00	2025-08-17 16:27:08.457724+00	\N	2025-08-17 18:26:04.059169+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
0d192962-26fa-4bc1-825d-b45ae8119426	David	Thompson	Chief Marketing Officer	Marketing	a94483dd-5541-4a47-a4ff-7fca34c3c0dc	Conference	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.442526+00	2025-08-17 16:27:08.442526+00	\N	2025-08-17 18:26:04.238915+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
b814c6f9-c64f-41b5-9cb7-efbda3eec201	Michael	Chen	Chief Technology Officer	Technology	64c5858d-837d-4ad3-9878-cf5d29e7dd56	LinkedIn	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.437871+00	2025-08-17 16:27:08.437871+00	\N	2025-08-17 18:26:04.290243+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
ed978572-eb7b-45e3-8ebe-110be50532b0	Lisa	Wang	Chief Operating Officer	Operations	1f8f16a7-3562-4df8-bbdc-a0e4b6e14cee	Cold Outreach	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.444646+00	2025-08-17 16:27:08.444646+00	\N	2025-08-17 18:26:04.370176+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
6eca4c01-5293-4731-aabf-fd6c344d0d67	Rachel	Davis	Business Analyst	Data Science	1de20cb2-4b55-4a4d-9eba-f10e78c4e09f	Supplier Database	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.463163+00	2025-08-17 16:27:08.463163+00	\N	2025-08-17 18:26:04.407443+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
81d174e5-2463-4e9e-88fd-4a2afb634c29	Andrew	Hall	Financial Analyst	Research & Development	01be7874-0098-4ec5-9d48-9393ca57bc98	Regulatory Contact	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.475224+00	2025-08-17 16:27:08.475224+00	\N	2025-08-17 18:26:03.949931+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
b1341729-7ed9-4d0f-94a0-f22777102ca6	Test	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
850814ac-df49-4c86-95f5-4656951822a1	NoOwner	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	\N	\N
8e904d98-97f8-420e-a1fb-24ae5962a80d	WithOwner	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
cd55c2c8-ecd2-487e-a1c4-52c280c2bf4c	Sarah	Johnson	Chief Executive Officer	Executive	d0f76f75-3ae1-4cdd-9992-834dd2c73352	Website Contact Form	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.951731+00	2025-08-18 02:55:14.951731+00	\N	\N	\N
2771d43c-c1f9-4bda-9885-f81fea26023c	Michael	Chen	Chief Technology Officer	Technology	44559722-1c94-4a08-a4ca-e261232fc1dc	LinkedIn	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.954757+00	2025-08-18 02:55:14.954757+00	\N	\N	\N
267eb4cd-fd86-40db-9a1a-17692fd0e23c	Emily	Rodriguez	Chief Financial Officer	Finance	79920099-87c1-4d41-a729-e0d094024b16	Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.9572+00	2025-08-18 02:55:14.9572+00	\N	\N	\N
d461e239-611f-4a1c-a768-81bb4c34a0df	David	Thompson	Chief Marketing Officer	Marketing	cf8480e6-4b3d-4019-8609-55d1c281f9da	Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.959393+00	2025-08-18 02:55:14.959393+00	\N	\N	\N
afc348bd-91d6-4d70-b977-a539027e318a	Lisa	Wang	Chief Operating Officer	Operations	63b90681-c4e2-4cbb-befc-fa91dff784ff	Cold Outreach	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.961548+00	2025-08-18 02:55:14.961548+00	\N	\N	\N
9b539c21-7c5d-4a8f-a0ec-87fb99dcda53	Robert	Anderson	Senior Software Engineer	Engineering	34021023-0fb6-4c0d-9bcd-d6837527fbeb	Trade Show	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.963453+00	2025-08-18 02:55:14.963453+00	\N	\N	\N
85431359-6040-491f-89a6-d18c651dda35	Jennifer	Martinez	Product Manager	Product	3a794c42-3fba-4420-9429-e8f748b8df62	Job Board	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.965393+00	2025-08-18 02:55:14.965393+00	\N	\N	\N
ce38cfeb-efc5-4be9-943d-8a7d13054252	Christopher	Wilson	Sales Director	Sales	9c4b0c2c-a0c0-4a83-b3e0-a49720c81efa	Direct Contact	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.967148+00	2025-08-18 02:55:14.967148+00	\N	\N	\N
41a1889f-0ce5-44b6-90ae-74f94ae8395f	Amanda	Taylor	Marketing Manager	Human Resources	5dd6c10e-e69f-4605-af41-15a4bfcd08b9	Social Media	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.968876+00	2025-08-18 02:55:14.968876+00	\N	\N	\N
29f657bd-ad62-4ff8-9079-e752adb8fc95	James	Brown	Human Resources Director	Quality Assurance	6e29d6c2-227a-4659-8e7c-dd92252ab48e	Employee Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.970778+00	2025-08-18 02:55:14.970778+00	\N	\N	\N
9e870dbe-365e-47a7-a95c-0f67dd9cebde	Maria	Garcia	Operations Manager	Business Development	57067e69-33eb-49da-aa15-16734a81c54c	Professional Network	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.98131+00	2025-08-18 02:55:14.98131+00	\N	\N	\N
7815fdbc-9c74-42e0-bbce-f38f376245b8	Kevin	Lee	Quality Assurance Specialist	Project Management	e1610917-e0ac-4ca7-b679-41f9fd999ede	Industry Event	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.983979+00	2025-08-18 02:55:14.983979+00	\N	\N	\N
b6a49221-833f-4f0e-9a50-c851993efc85	Rachel	Davis	Business Analyst	Data Science	6ebdf198-7536-4165-a182-8662e0669bcc	Supplier Database	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.98635+00	2025-08-18 02:55:14.98635+00	\N	\N	\N
908904fb-611c-4d96-ac00-112efaad8b5a	Thomas	Miller	Project Manager	Design	cf676777-5028-4d3b-b495-86915b78be21	Internal Promotion	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.988589+00	2025-08-18 02:55:14.988589+00	\N	\N	\N
91fc63e7-940c-4fb1-9c07-c465ac942d49	Nicole	White	Data Scientist	DevOps	c22d69b8-2733-47dc-804d-fa156cb38bc2	Portfolio Website	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.990867+00	2025-08-18 02:55:14.990867+00	\N	\N	\N
8dd1c642-ce9c-4c71-9edb-71cbc4f4fbd4	Daniel	Clark	UX Designer	Legal	d0f76f75-3ae1-4cdd-9992-834dd2c73352	GitHub Profile	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.99273+00	2025-08-18 02:55:14.99273+00	\N	\N	\N
23391801-1492-42b3-8dbd-547d8543849e	Stephanie	Lewis	DevOps Engineer	Customer Success	44559722-1c94-4a08-a4ca-e261232fc1dc	Medical Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.995019+00	2025-08-18 02:55:14.995019+00	\N	\N	\N
31ecbbc0-e8e3-40d4-a154-82a3e5d00c26	Andrew	Hall	Financial Analyst	Research & Development	79920099-87c1-4d41-a729-e0d094024b16	Regulatory Contact	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.996861+00	2025-08-18 02:55:14.996861+00	\N	\N	\N
646d6f02-718a-4c53-bbbd-d58eea128eae	Jessica	Allen	Legal Counsel	Supply Chain	cf8480e6-4b3d-4019-8609-55d1c281f9da	Manufacturing Expo	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.998857+00	2025-08-18 02:55:14.998857+00	\N	\N	\N
121e9087-021e-40b7-940d-67ad17509dfc	Ryan	Young	Customer Success Manager	Risk Management	63b90681-c4e2-4cbb-befc-fa91dff784ff	Walk-in Application	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.000828+00	2025-08-18 02:55:15.000828+00	\N	\N	\N
236a6915-c1e6-4383-84a4-e1beeae48946	Ashley	King	Research & Development Lead	Compliance	34021023-0fb6-4c0d-9bcd-d6837527fbeb	Email Campaign	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.003111+00	2025-08-18 02:55:15.003111+00	\N	\N	\N
37df802c-9567-49cd-ac53-32844bfac8e9	Matthew	Wright	Supply Chain Coordinator	Production	3a794c42-3fba-4420-9429-e8f748b8df62	Webinar	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.005017+00	2025-08-18 02:55:15.005017+00	\N	\N	\N
287bc30a-d62a-4e07-a6f8-c5046d07f99e	Lauren	Lopez	Risk Analyst	Investment	9c4b0c2c-a0c0-4a83-b3e0-a49720c81efa	Partner Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.007084+00	2025-08-18 02:55:15.007084+00	\N	\N	\N
54c1338c-8fa7-4983-9757-423a70ef6cf5	Joshua	Hill	Compliance Officer	Medical	5dd6c10e-e69f-4605-af41-15a4bfcd08b9	Alumni Network	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.008809+00	2025-08-18 02:55:15.008809+00	\N	\N	\N
b24ead22-d7df-4e0f-a8f5-79dd1d93f71f	Megan	Scott	Production Supervisor	Nursing	6e29d6c2-227a-4659-8e7c-dd92252ab48e	Professional Association	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.010621+00	2025-08-18 02:55:15.010621+00	\N	\N	\N
52960a86-cfc0-476b-b93a-eac715fd2227	Justin	Green	Investment Manager	Retail	57067e69-33eb-49da-aa15-16734a81c54c	Online Directory	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.01335+00	2025-08-18 02:55:15.01335+00	\N	\N	\N
a40ac272-8ac6-455e-8d84-bd776c8a067e	Hannah	Adams	Medical Director	Administration	e1610917-e0ac-4ca7-b679-41f9fd999ede	Press Release	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.015517+00	2025-08-18 02:55:15.015517+00	\N	\N	\N
b27f9347-98a5-4539-a8a3-cec91d478d58	Brandon	Baker	Nurse Practitioner	Strategy	6ebdf198-7536-4165-a182-8662e0669bcc	Trade Publication	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.017433+00	2025-08-18 02:55:15.017433+00	\N	\N	\N
2ee58325-4cf0-4ccb-99a2-4d2259a7c52a	Kayla	Gonzalez	Physician Assistant	Communications	cf676777-5028-4d3b-b495-86915b78be21	Award Ceremony	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.01926+00	2025-08-18 02:55:15.01926+00	\N	\N	\N
0eb4c92d-9868-4774-9318-f87dce8e1ce1	Tyler	Nelson	Store Manager	Public Relations	c22d69b8-2733-47dc-804d-fa156cb38bc2	Charity Event	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.021172+00	2025-08-18 02:55:15.021172+00	\N	\N	\N
a65d6716-0816-480b-a6a6-77b4b62f9330	Alexandra	Carter	Assistant Manager	Brand Management	d0f76f75-3ae1-4cdd-9992-834dd2c73352	University Career Fair	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.023966+00	2025-08-18 02:55:15.023966+00	\N	\N	\N
367e6934-6b67-497f-888a-53155fa4fbc8	Zachary	Mitchell	Sales Associate	Accounting	44559722-1c94-4a08-a4ca-e261232fc1dc	Industry Conference	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.025883+00	2025-08-18 02:55:15.025883+00	\N	\N	\N
2c88a6c9-6f3b-4fd8-86fa-fd0581c2dcb2	Victoria	Perez	Marketing Specialist	Tax	79920099-87c1-4d41-a729-e0d094024b16	Client Referral	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.027932+00	2025-08-18 02:55:15.027932+00	\N	\N	\N
ceb3f035-6384-4650-b385-02b8c704f477	Nathan	Roberts	Account Executive	Audit	cf8480e6-4b3d-4019-8609-55d1c281f9da	Vendor Introduction	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.029576+00	2025-08-18 02:55:15.029576+00	\N	\N	\N
0a518a68-b89c-4e08-aee0-c05334e7dc57	Samantha	Turner	Business Development Manager	Portfolio Management	63b90681-c4e2-4cbb-befc-fa91dff784ff	Competitor Analysis	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.031155+00	2025-08-18 02:55:15.031155+00	\N	\N	\N
b19ac50e-e030-41bb-9671-53b1dd331a30	Eric	Phillips	Technical Lead	Executive	34021023-0fb6-4c0d-9bcd-d6837527fbeb	Market Research	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.032843+00	2025-08-18 02:55:15.032843+00	\N	\N	\N
01b05834-bb0d-43c8-b4da-ed27dbd912a9	Rebecca	Campbell	System Administrator	Technology	3a794c42-3fba-4420-9429-e8f748b8df62	Social Networking	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.034666+00	2025-08-18 02:55:15.034666+00	\N	\N	\N
e1e0af9b-b354-492c-ad7a-1eac6822b94f	Adam	Parker	Network Engineer	Finance	9c4b0c2c-a0c0-4a83-b3e0-a49720c81efa	Online Advertisement	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.036675+00	2025-08-18 02:55:15.036675+00	\N	\N	\N
120b214a-074b-4a9a-9fc5-ca36d2a2f9b3	Michelle	Evans	Database Administrator	Marketing	5dd6c10e-e69f-4605-af41-15a4bfcd08b9	Content Marketing	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.039157+00	2025-08-18 02:55:15.039157+00	\N	\N	\N
f62f2ffe-bc11-4ad4-aa1e-394c378a0961	Steven	Edwards	Security Specialist	Operations	6e29d6c2-227a-4659-8e7c-dd92252ab48e	SEO	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.040992+00	2025-08-18 02:55:15.040992+00	\N	\N	\N
376ca675-1847-46a9-bca9-e44389fa2b37	Amber	Collins	Content Strategist	Engineering	57067e69-33eb-49da-aa15-16734a81c54c	Paid Search	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.042856+00	2025-08-18 02:55:15.042856+00	\N	\N	\N
f6fba39d-6836-4bae-9510-36e23bb12d7a	Timothy	Stewart	Social Media Manager	Product	e1610917-e0ac-4ca7-b679-41f9fd999ede	Display Advertising	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.044523+00	2025-08-18 02:55:15.044523+00	\N	\N	\N
97b27d1b-a376-4804-a447-ecd4dd1cda7f	Danielle	Sanchez	Event Coordinator	Sales	6ebdf198-7536-4165-a182-8662e0669bcc	Retargeting	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.046637+00	2025-08-18 02:55:15.046637+00	\N	\N	\N
bd856c40-6e97-4f86-a3b9-7aba2618a39c	Kyle	Morris	Public Relations Manager	Human Resources	cf676777-5028-4d3b-b495-86915b78be21	Affiliate Marketing	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.048904+00	2025-08-18 02:55:15.048904+00	\N	\N	\N
2a4ec289-cd62-496d-9635-e0b2959234c9	Brittany	Rogers	Brand Manager	Quality Assurance	c22d69b8-2733-47dc-804d-fa156cb38bc2	Influencer Partnership	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.051077+00	2025-08-18 02:55:15.051077+00	\N	\N	\N
a3359bff-5b5f-4e0a-a8fc-d5b45b3a0024	Jeffrey	Reed	Financial Controller	Business Development	d0f76f75-3ae1-4cdd-9992-834dd2c73352	Podcast Interview	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.053468+00	2025-08-18 02:55:15.053468+00	\N	\N	\N
0c444676-f5e5-4275-b438-caff065b3d22	Courtney	Cook	Tax Specialist	Project Management	44559722-1c94-4a08-a4ca-e261232fc1dc	Guest Blog Post	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.055531+00	2025-08-18 02:55:15.055531+00	\N	\N	\N
78181568-b3e1-4765-a657-38ccecc3bf26	e	s	s	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
4f586d8f-4b05-4bb9-8b3a-70ccaccfefd6	Mark	Morgan	Auditor	Data Science	79920099-87c1-4d41-a729-e0d094024b16	Speaking Engagement	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.057353+00	2025-08-18 02:55:15.057353+00	\N	\N	\N
b2eba624-0dd1-4178-964d-837b6959c1a5	Tiffany	Bell	Investment Analyst	Design	cf8480e6-4b3d-4019-8609-55d1c281f9da	Website Contact Form	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.059224+00	2025-08-18 02:55:15.059224+00	\N	\N	\N
cd4a1698-ccc4-4e51-b67d-0359d996f47e	Brian	Murphy	Portfolio Manager	DevOps	63b90681-c4e2-4cbb-befc-fa91dff784ff	LinkedIn	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.06104+00	2025-08-18 02:55:15.06104+00	\N	\N	\N
e76c2a1a-4d6a-4011-bb66-28f982b368a3	Sarah	Green	Operations Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
b52e1ec2-72b9-4daa-a152-e51c18212248	Michael	Brown	Marketing Director	Marketing	e124301d-e9af-42c1-a361-0c0882547f7a	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:01:07.849795+00	2025-08-15 07:01:07.849795+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
f3975c04-6a1d-424a-a98e-a88199b671b3	Emily	Davis	Product Manager	Product	e124301d-e9af-42c1-a361-0c0882547f7a	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:01:07.852163+00	2025-08-15 07:01:07.852163+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
a53a16e5-cb11-4d7a-899b-f9e71e88bf9d	David	Wilson	CTO	Technology	e124301d-e9af-42c1-a361-0c0882547f7a	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:01:07.854848+00	2025-08-15 07:01:07.854848+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
b8702a2e-e0f1-4176-8419-27442c0be258	Lisa	Anderson	HR Director	Human Resources	e124301d-e9af-42c1-a361-0c0882547f7a	LinkedIn	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.822705+00	2025-08-15 07:27:04.822705+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
455654b8-8ed2-4c6b-9988-4ff53f1c9ebe	Robert	Taylor	Finance Manager	Finance	e124301d-e9af-42c1-a361-0c0882547f7a	Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.831416+00	2025-08-15 07:27:04.831416+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
2b918485-ff1a-422c-9066-4a29beca5fb1	Jennifer	Martinez	Customer Success Manager	Customer Success	e124301d-e9af-42c1-a361-0c0882547f7a	Website	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.83467+00	2025-08-15 07:27:04.83467+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
87e258c1-c9eb-4c70-8fc6-22089060885d	Christopher	Garcia	Lead Developer	Engineering	e124301d-e9af-42c1-a361-0c0882547f7a	Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.83819+00	2025-08-15 07:27:04.83819+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
f8b962a2-4cc9-47e3-9e22-9db5f797c95f	Amanda	Rodriguez	UX Designer	Design	e124301d-e9af-42c1-a361-0c0882547f7a	LinkedIn	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.84103+00	2025-08-15 07:27:04.84103+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
f10d7250-7b11-4fd8-b79a-5c1db9f46cc6	James	Lee	Business Analyst	Business	e124301d-e9af-42c1-a361-0c0882547f7a	Website	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.843557+00	2025-08-15 07:27:04.843557+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
5417330b-bb97-44d5-9854-128d4ad23cc0	Michelle	White	Operations Manager	Operations	e124301d-e9af-42c1-a361-0c0882547f7a	Referral	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.846001+00	2025-08-15 07:27:04.846001+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
6cc01ce7-f735-45c6-9482-8f85001ae6b9	Daniel	Thompson	Data Scientist	Data Science	e124301d-e9af-42c1-a361-0c0882547f7a	Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.848849+00	2025-08-15 07:27:04.848849+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
7c3cc563-ccc8-4efb-b40b-c63e0fa45cc3	Jessica	Clark	Content Strategist	Marketing	e124301d-e9af-42c1-a361-0c0882547f7a	LinkedIn	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.851617+00	2025-08-15 07:27:04.851617+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
ea07c16d-f103-4381-8004-c7397487fd41	Matthew	Lewis	DevOps Engineer	Engineering	e124301d-e9af-42c1-a361-0c0882547f7a	Website	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.855695+00	2025-08-15 07:27:04.855695+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
661d7e5f-1697-412d-94dd-28fb861173dc	Nicole	Hall	Legal Counsel	Legal	e124301d-e9af-42c1-a361-0c0882547f7a	Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.858881+00	2025-08-15 07:27:04.858881+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
35bbc30a-769d-4998-9801-0c5597357d16	Andrew	Young	Quality Assurance Lead	Engineering	e124301d-e9af-42c1-a361-0c0882547f7a	Conference	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.862808+00	2025-08-15 07:27:04.862808+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
9bc72c9f-cd34-40df-94e1-58b980d318c6	Stephanie	King	Event Coordinator	Marketing	e124301d-e9af-42c1-a361-0c0882547f7a	LinkedIn	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.868233+00	2025-08-15 07:27:04.868233+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
4b967856-c128-40ae-8e5d-7b3ed7c2f39e	Kevin	Wright	Security Specialist	IT	e124301d-e9af-42c1-a361-0c0882547f7a	Website	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.872121+00	2025-08-15 07:27:04.872121+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
b82e055b-d3c7-45e2-9faf-8d0868981976	Test	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b	2025-08-17 18:26:04.124942+00	ba774a5b-22b2-4766-b985-97548b2380dc
d5357fc4-34c7-4ed0-921b-71079274851c	Rachel	Lopez	Training Coordinator	Human Resources	e124301d-e9af-42c1-a361-0c0882547f7a	Referral	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 07:27:04.875096+00	2025-08-15 07:27:04.875096+00	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b
29c34d86-b18e-421d-b804-58c6b44e1b3d	Test	Contact	\N	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	2025-08-17 18:22:41.472271+00	ba774a5b-22b2-4766-b985-97548b2380dc
87bebaf8-c2ec-4706-9a95-5ce3c56c210d	Kevin	Lee	Risk Analyst	Risk Management	91ebf292-9cfc-494d-957e-ee34f9137fec	Industry Event	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.557771+00	2025-08-15 08:11:07.557771+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
33200ec1-d51c-425f-b835-dd3a2f68d357	Rachel	Davis	Supply Chain Coordinator	Supply Chain	570512eb-aabf-42b9-b485-3df0effee807	Supplier Database	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.559602+00	2025-08-15 08:11:07.559602+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
f3d6d7a4-32d4-4345-868a-20ba08f9e8de	Thomas	Miller	Assistant Manager	Retail	af5e910f-9054-4c3f-b509-c3815aaade72	Internal Promotion	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.562323+00	2025-08-15 08:11:07.562323+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
a52e1a72-fb18-4760-993f-da512aa8ec9a	Nicole	White	UX Designer	Design	30d8b0b0-2d20-427f-a456-f261f662ba99	Portfolio Website	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.564421+00	2025-08-15 08:11:07.564421+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
a3e05fc1-2374-4f1f-9a62-838b78d9333f	Daniel	Clark	DevOps Engineer	Engineering	30d8b0b0-2d20-427f-a456-f261f662ba99	GitHub Profile	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.566164+00	2025-08-15 08:11:07.566164+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
4ed58860-7eef-4aba-b152-ee469234363b	Stephanie	Lewis	Physician Assistant	Medical	82394f79-e8ee-41c9-94bf-1ff2acad6975	Medical Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.567914+00	2025-08-15 08:11:07.567914+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
53b9eb8c-555d-45f5-ad60-b135a14dc3fa	Andrew	Hall	Compliance Officer	Compliance	91ebf292-9cfc-494d-957e-ee34f9137fec	Regulatory Contact	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.569634+00	2025-08-15 08:11:07.569634+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
e918cd8e-64b0-45c9-8310-bf3c4c01598a	Jessica	Allen	Production Supervisor	Production	570512eb-aabf-42b9-b485-3df0effee807	Manufacturing Expo	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.571279+00	2025-08-15 08:11:07.571279+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
ace9c7b8-86e9-4b48-a126-75f22e14fdff	Ryan	Young	Sales Associate	Sales	af5e910f-9054-4c3f-b509-c3815aaade72	Walk-in Application	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.572963+00	2025-08-15 08:11:07.572963+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
ee54ca3b-fe64-472e-807c-f04975020c02	Emily	Rodriguez	Chief Financial Officer	Finance	7c7644ee-cb23-4dfb-8ed5-39edae86c278	Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.208568+00	2025-08-15 08:22:51.208568+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
2e9b5160-e260-4461-86ca-0febd7a1f096	Christopher	Wilson	Sales Director	Sales	216032e1-d6c7-4a1f-a012-08c08b627b8d	Direct Contact	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.924251+00	2025-08-15 08:22:52.924251+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
c685caad-fbcd-419d-986d-0511ef70225a	James	Brown	Human Resources Director	Quality Assurance	139e04fa-bdec-43d5-bb91-2848815d7a07	Employee Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.928999+00	2025-08-15 08:22:52.928999+00	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0
84a78805-f02b-4e86-8c1b-9f7e31b2ee81	James	Wilson	Store Manager	Retail	d6d87d98-9660-4cfc-85c0-2e2df0ebe0e9	Direct Contact	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.957512+00	2025-08-15 08:14:15.957512+00	\N	2025-08-17 18:26:03.624497+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
cbd4452d-aaf1-438d-a557-0d14660a9da7	Ryan	Young	Sales Associate	Sales	d6d87d98-9660-4cfc-85c0-2e2df0ebe0e9	Walk-in Application	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.980982+00	2025-08-15 08:14:15.980982+00	\N	2025-08-17 18:26:03.640317+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
0aea655d-a229-4d3f-9f0d-ac7839e4de73	Daniel	Clark	UX Designer	Legal	ec4f7848-824e-4fb6-9551-ea1473dcfb3f	GitHub Profile	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.94486+00	2025-08-15 08:22:52.94486+00	\N	2025-08-17 18:26:03.694629+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
b1c9ea0c-abb2-4f4c-b0ea-c2eed22cf6dc	Nicole	White	UX Designer	Design	e8849080-2368-478d-b4ce-b87ebd7974b2	Portfolio Website	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.972119+00	2025-08-15 08:14:15.972119+00	\N	2025-08-17 18:26:03.715398+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
6d08d8b0-ea3b-46d0-b487-49f7898d3f12	Nicole	White	Data Scientist	DevOps	cfca2e1f-8426-47f9-b582-07400862bd4c	Portfolio Website	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.942582+00	2025-08-15 08:22:52.942582+00	\N	2025-08-17 18:26:03.726084+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
6bd0ec2e-be4d-4b24-b0ab-ca34d2fe0fbf	Robert	Anderson	Operations Manager	Operations	04ba9ed7-7b34-4442-9fae-6367d79481cf	Trade Show	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.953224+00	2025-08-15 08:14:15.953224+00	\N	2025-08-17 18:26:03.749283+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
dcab4bb7-8b17-4b0f-b6b2-65c54fa0cb6c	Robert	Anderson	Senior Software Engineer	Engineering	005fd3c7-3b66-4d04-a14f-c719a3147f1d	Trade Show	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.919844+00	2025-08-15 08:22:52.919844+00	\N	2025-08-17 18:26:03.759516+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
673e3787-b9d3-4f29-8c99-47bd4288c0ae	Ashley	King	Research & Development Lead	Compliance	005fd3c7-3b66-4d04-a14f-c719a3147f1d	Email Campaign	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.960491+00	2025-08-15 08:22:52.960491+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
89c62806-64bb-4f75-9a89-db2e53ba0e3d	Lauren	Lopez	Risk Analyst	Investment	216032e1-d6c7-4a1f-a012-08c08b627b8d	Partner Referral	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.966883+00	2025-08-15 08:22:52.966883+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
64a602ac-e866-4ed9-a2dc-ceca1c817857	Joshua	Hill	Compliance Officer	Medical	a8eb5b3c-2efc-40f7-b64b-e05ce198507d	Alumni Network	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.972655+00	2025-08-15 08:22:52.972655+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
a44420fd-7110-4dad-9da9-ca2b193f3b2d	Megan	Scott	Production Supervisor	Nursing	139e04fa-bdec-43d5-bb91-2848815d7a07	Professional Association	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.976457+00	2025-08-15 08:22:52.976457+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
bb9580c7-23e9-46fb-855f-a941a7bfee44	Justin	Green	Investment Manager	Retail	63ac9507-3b40-4410-96f6-deaf949d8aa9	Online Directory	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.980013+00	2025-08-15 08:22:52.980013+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
c218f25f-f12c-4bd6-ba47-5ceac93febcf	Hannah	Adams	Medical Director	Administration	ea6652d1-dbd5-4bee-a831-60b6aacd706a	Press Release	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.984198+00	2025-08-15 08:22:52.984198+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
9eabb160-fca8-406b-89ac-0b3176ae679c	Brandon	Baker	Nurse Practitioner	Strategy	be65e1b5-8ce7-4426-b5f8-1625321a854c	Trade Publication	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.987865+00	2025-08-15 08:22:52.987865+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
8330bd5c-2c78-499a-8271-070ce50b33ca	Kayla	Gonzalez	Physician Assistant	Communications	a3933216-7f83-41aa-953a-c805b5c47789	Award Ceremony	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.990846+00	2025-08-15 08:22:52.990846+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
1d09275b-feab-48d0-b599-68db8a516674	Tyler	Nelson	Store Manager	Public Relations	cfca2e1f-8426-47f9-b582-07400862bd4c	Charity Event	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.99316+00	2025-08-15 08:22:52.99316+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
e403d4a2-31b4-4d06-819a-08f3f0967020	Alexandra	Carter	Assistant Manager	Brand Management	ec4f7848-824e-4fb6-9551-ea1473dcfb3f	University Career Fair	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.996935+00	2025-08-15 08:22:52.996935+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
27f6e5ec-817d-4ad2-afba-d3e1b10e5b3f	Zachary	Mitchell	Sales Associate	Accounting	ca85637b-3852-444f-af3f-a42b032191be	Industry Conference	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.999242+00	2025-08-15 08:22:52.999242+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
0919ca3b-5414-4387-80b4-b53d278ab1e9	Victoria	Perez	Marketing Specialist	Tax	7c7644ee-cb23-4dfb-8ed5-39edae86c278	Client Referral	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.001815+00	2025-08-15 08:22:53.001815+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
2ccfbd5b-2ff9-4172-8a30-a3fff5710238	Nathan	Roberts	Account Executive	Audit	6c1effb0-40d8-4e3c-ad9a-1a80f7371bf6	Vendor Introduction	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.004343+00	2025-08-15 08:22:53.004343+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
47efeca3-a40e-4f19-baee-83b8c2ce8efc	Samantha	Turner	Business Development Manager	Portfolio Management	9dc9056f-a165-4002-a9a6-552dd5305f7a	Competitor Analysis	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.006294+00	2025-08-15 08:22:53.006294+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
f0dff0ba-f719-4f96-8616-af6590d75401	Eric	Phillips	Technical Lead	Executive	005fd3c7-3b66-4d04-a14f-c719a3147f1d	Market Research	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.008226+00	2025-08-15 08:22:53.008226+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
b754692c-7ebe-4721-8c4d-d79d0c9c4410	Rebecca	Campbell	System Administrator	Technology	a438d48a-ee50-448e-852e-7a7d4d5c704b	Social Networking	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.010199+00	2025-08-15 08:22:53.010199+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
c2a5e03b-3c79-4a89-b735-f4e5b37ca0da	Adam	Parker	Network Engineer	Finance	216032e1-d6c7-4a1f-a012-08c08b627b8d	Online Advertisement	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.01397+00	2025-08-15 08:22:53.01397+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
345de5af-b5ec-4596-ac21-f0b7ea4e25ad	Michelle	Evans	Database Administrator	Marketing	a8eb5b3c-2efc-40f7-b64b-e05ce198507d	Content Marketing	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.01687+00	2025-08-15 08:22:53.01687+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
2604602e-b45e-46ce-beb2-889a80004c15	Steven	Edwards	Security Specialist	Operations	139e04fa-bdec-43d5-bb91-2848815d7a07	SEO	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:53.018999+00	2025-08-15 08:22:53.018999+00	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea
e4206740-6e12-438a-88c0-20d34a77d92a	Brian	Le	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	\N	ba774a5b-22b2-4766-b985-97548b2380dc
9701b59a-e8b6-4eec-b8d6-e717727e350f	Test	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b	\N	ba774a5b-22b2-4766-b985-97548b2380dc
07f0ccc1-a7c8-4c9d-868c-6d239d41c0b6	Test	Contact	\N	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	2025-08-17 18:26:04.103871+00	ba774a5b-22b2-4766-b985-97548b2380dc
ef29d198-0b17-4648-bc19-a560af3ea84e	Test	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b	2025-08-17 18:26:04.114095+00	ba774a5b-22b2-4766-b985-97548b2380dc
688d4bab-34a5-4096-b775-9a062a035f6c	Test	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b	2025-08-17 18:26:04.136247+00	ba774a5b-22b2-4766-b985-97548b2380dc
abb14855-358b-457e-9499-e069ceffc550	e	s	s	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	\N	ba774a5b-22b2-4766-b985-97548b2380dc
b71ee491-3ce5-454b-ac30-52a257a6545a	Full	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
3ae8ea21-9bbb-4793-a817-4400d1e0bbb6	Full	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
546079f5-23d1-4df5-bfa5-2f99cd73a3bc	Test	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
108648cc-0f9b-460f-b395-45866ff4d812	Brian	Le	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
e85bbb6e-f89c-4248-a41f-25fe355019de	Be	Le	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
4d418fbb-02f8-4846-87c8-2c8bf36bbaba	Test	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	2025-08-17 18:26:04.092402+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
187fda48-b249-4fcc-97ee-5440c5f066ae	Test	Contact	\N	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	2025-08-17 18:26:04.145204+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
eae9618c-e785-4e67-8e1b-954d4b104b22	Brian	Le	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	2025-08-17 18:26:04.176808+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
15fa7258-5b38-4274-a444-fb1058660269	Brian	Le	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	2025-08-17 18:26:04.185422+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
0e4fc00d-a6f8-4fa4-94f2-5d452a40a23d	Brian	Le	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	2025-08-17 18:26:04.194661+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
7499da4f-8de6-44ff-8a0c-5648e11a4e43	Brian	Le	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	2025-08-17 18:26:04.205272+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
ebd5e6ec-686b-453c-b9e8-4268c698a5d4	Full	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	2025-08-17 18:26:04.248428+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
a0994732-d8a5-4aca-8de3-cc99aee72de4	Full	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	2025-08-17 18:26:04.259357+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
8f11d597-0bb8-4c0e-aacc-65b9a24dd83f	Be	Le	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	2025-08-17 18:26:04.299175+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
fd6b2fcf-5ae6-42a9-8d02-4a1cbf9b9e70	Anthony	Green	QA Engineer	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
5591d830-f231-4277-a277-3d76bb56fda4	Kevin	Smith	Legal Counsel	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
af70e48c-e93a-4931-8158-46b6e2897ddc	Maria	Torres	CEO	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
9ddc27e3-c6b8-4a48-96dd-134a6750b48c	Donna	Williams	Marketing Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
68e3ca4e-3c35-4236-ab30-c36fd6c4df7e	Susan	Roberts	CTO	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
ac627c24-26bd-4153-8de0-03b2ee5e74bc	Betty	Lewis	Product Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
06d0ccfe-781d-4187-9a23-19641e6f10e2	Daniel	Rivera	Operations Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
20d6a06f-e74b-420d-b563-8f76414a5eaf	Steven	Torres	VP of Sales	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
b682efe6-31da-4566-8de1-f50acba3ebf3	Paul	Nguyen	Account Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
99102125-6daa-43ba-9cff-9b0491cc0b38	Robert	Mitchell	Scrum Master	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
2d4cc63f-2396-48d9-81cd-01e7f59f6bec	James	Johnson	Social Media Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
0fb2521b-2d80-42da-bbfb-625601e9d72f	James	Sanchez	VP of Engineering	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
b6a53116-3265-4a29-a01a-96bef1b8cf89	Sarah	Jackson	Legal Counsel	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
5e530eda-fdaa-4aa4-9871-97252dccc966	John	Smith	CFO	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
fd2a737d-bcde-46c8-8fc1-d8fa20bff3f0	Kenneth	Smith	Senior Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
e68d1e20-84fd-4564-a757-fe3f272e43fa	Patricia	Jackson	Public Relations	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
8e678b0a-06cb-4b34-8a09-1a4542408ad8	Tee	Higgens	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	\N	ba774a5b-22b2-4766-b985-97548b2380dc
d320e4e0-9e0f-4eaf-b97e-4ab85851873e	Donna	Anderson	Product Owner	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
b74b2fe6-38d2-4154-b6ca-007acd6bdb58	Steven	Nguyen	VP of Engineering	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
cbb6f458-1c3d-4a48-afc5-799bbcca4671	Jessica	Martin	VP of Sales	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
9486dee5-bc02-4d1d-b12b-f3e48d5eb10a	Timothy	Walker	Logistics Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
a1741766-bcc5-45aa-8381-f9492d35f90d	Anthony	Gonzalez	SEO Specialist	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
4f42bc46-27e6-43c7-8926-b06468656b34	Donald	Mitchell	Backend Developer	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
e20382b4-fca4-4077-8b46-371051520383	Susan	Garcia	Event Coordinator	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
367924b0-7eec-4b7c-8f17-13d0917dde8e	Carol	Garcia	Backend Developer	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
a48a2ac3-5ae2-4705-9a1f-b0a7ff153333	Edward	Walker	Full Stack Developer	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
7cd47f9d-7f2d-4765-86f2-b15b48ebb899	Christopher	Green	Human Resources	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
70b3a0a7-cbb0-4f1f-a290-e88b67dc5c7f	Steven	Jones	System Administrator	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
5b34b9e3-c6e1-4172-96de-077be7ef499f	Emily	Mitchell	Quality Assurance	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
55624910-09e2-4469-b63f-e1263eac2186	George	Carter	Director of Operations	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
93ff41f7-db8a-41d6-b4cf-bac491a97e4c	Thomas	Lee	Operations Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
1df24149-8a82-4f17-b240-4d8021bd9a35	Ronald	Miller	Human Resources	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
8fd7a0ba-5385-4542-b9fb-783cec2ad609	Nancy	Torres	Training Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
d1f54120-9910-4443-9c07-3f9d25346855	Thomas	King	DevOps Engineer	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
9bb2f1cd-9dbb-4ee8-9c30-bd18aa95d6a6	Helen	Wilson	Event Coordinator	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
dc42dff5-df03-483f-b42f-620450d5c955	John	Martin	VP of Marketing	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
521f72e2-c737-46aa-a0e1-4510aebff95b	Deborah	King	Customer Success	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
0e85ece1-089a-4c4e-b98d-ca04a42c05b3	Jessica	Moore	Technical Lead	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
94b6ee70-b56b-48b7-bba6-af3d7bc4e6b9	Laura	Rodriguez	Director of Operations	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
bcb6a848-02e9-4338-a9c6-0f3f4cb92714	Donna	Green	QA Engineer	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
686e2af8-b08c-412c-b26f-83bdfb00c042	James	Perez	Product Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
3db982a1-3b4a-4fe4-bf47-ac68037b5a49	Sharon	Clark	VP of Marketing	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
ef5fccc8-faa5-4fe7-90ce-9b8d67b386cf	Tee	Higgens	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	2025-08-17 18:22:41.44137+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
d6d98fe3-5973-4b10-bc11-e39ab7687b5b	Test	Contact	\N	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	2025-08-17 18:22:41.456728+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
3f84a861-3b0f-496b-8dff-85191463435f	Be	Le	manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	2025-08-17 18:22:41.495283+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
cb3936b9-1e3c-4d72-95ca-3d80f613f7ec	Be	Le	manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	2025-08-17 18:26:04.309075+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
34ad8b95-788e-49da-9e60-a5105158484a	Kevin	King	CTO	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
1d1f1be9-828c-474b-84b7-c7603dc19273	Steven	Ramirez	Operations Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
a9a5d69b-ac39-4d6b-8c6c-a94949a9c3b6	William	Gonzalez	DevOps Engineer	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
893ee0ec-c718-497d-89bd-a98a21a30163	Emily	Campbell	Brand Manager	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	8b531e80-6526-4d0c-93ce-db70cc2366ea	\N	ba774a5b-22b2-4766-b985-97548b2380dc
4ca5e3bb-818b-4ea2-bdc4-302ba84030dd	Ashley	King	Research & Development Lead	Compliance	446386c2-676b-47e4-bf0b-e05774eb791a	Email Campaign	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.481487+00	2025-08-17 16:27:08.481487+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
29785965-f1d8-404b-b676-66eb57674d18	Matthew	Wright	Supply Chain Coordinator	Production	88463116-9630-499e-8ae9-76aeacf2851f	Webinar	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.483548+00	2025-08-17 16:27:08.483548+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
5eb898e5-99f9-4347-b46f-5856733e4b9c	Nathan	Roberts	Account Executive	Audit	a94483dd-5541-4a47-a4ff-7fca34c3c0dc	Vendor Introduction	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.50672+00	2025-08-17 16:27:08.50672+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
dccfe585-17f2-48de-bdb4-5cf2854f339a	Samantha	Turner	Business Development Manager	Portfolio Management	1f8f16a7-3562-4df8-bbdc-a0e4b6e14cee	Competitor Analysis	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.508557+00	2025-08-17 16:27:08.508557+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
951e604b-e969-4eca-8a13-c809f9c33ea9	Eric	Phillips	Technical Lead	Executive	446386c2-676b-47e4-bf0b-e05774eb791a	Market Research	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.510779+00	2025-08-17 16:27:08.510779+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
1b3a6439-679b-4f20-8346-976b28e5b77c	Rebecca	Campbell	System Administrator	Technology	88463116-9630-499e-8ae9-76aeacf2851f	Social Networking	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.512899+00	2025-08-17 16:27:08.512899+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
0e896c9c-119e-46c2-8abd-fb981c795ce5	Adam	Parker	Network Engineer	Finance	233915d4-3561-4a96-b8f4-539aee58d54a	Online Advertisement	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.514864+00	2025-08-17 16:27:08.514864+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
f824d895-18f5-4344-9ff7-bfb76ab6df98	Michelle	Evans	Database Administrator	Marketing	08d8f3c1-53ff-4445-9832-a1b02b3e0a98	Content Marketing	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.516757+00	2025-08-17 16:27:08.516757+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
6420c0a8-291d-4c42-b228-89764cde3686	Steven	Edwards	Security Specialist	Operations	4ccc9467-319f-468b-9b6a-ce29a5195ed6	SEO	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.518711+00	2025-08-17 16:27:08.518711+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
9bae19bf-73c6-4d44-913c-9dbc00975643	Be	Le	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	2025-08-17 18:26:04.317791+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
c0f35d3a-9c2d-4f7b-a6bb-1f92c55c415c	Amber	Collins	Content Strategist	Engineering	f95d5433-17a8-4a25-8a87-dfad8ac5793d	Paid Search	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.52055+00	2025-08-17 16:27:08.52055+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
6e859df2-22d8-41b6-99d4-dfceab790528	Timothy	Stewart	Social Media Manager	Product	c920fe2a-7619-46cf-80cd-18d08eceba2b	Display Advertising	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.52242+00	2025-08-17 16:27:08.52242+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
56b503da-5f9d-4b4f-88e7-f54679d45888	Tee	Higgens	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	2025-08-17 18:22:41.421906+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
4375098f-16fc-4d28-b962-52c7396818c8	Danielle	Sanchez	Event Coordinator	Sales	1de20cb2-4b55-4a4d-9eba-f10e78c4e09f	Retargeting	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.524296+00	2025-08-17 16:27:08.524296+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
1d1adc78-f37f-4139-8f20-987ee464e4ab	Kyle	Morris	Public Relations Manager	Human Resources	6d8cd793-a016-4ab7-9b39-b65b6aaecd0e	Affiliate Marketing	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.526365+00	2025-08-17 16:27:08.526365+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
77fb87b9-c482-48d9-98eb-a8959ff0e1c0	Jessica	Allen	Legal Counsel	Supply Chain	a94483dd-5541-4a47-a4ff-7fca34c3c0dc	Manufacturing Expo	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.477257+00	2025-08-17 16:27:08.477257+00	\N	2025-08-17 18:26:04.080453+00	ba774a5b-22b2-4766-b985-97548b2380dc
a188730d-46cd-4d96-bbb3-6cb5f4edcc3e	Brittany	Rogers	Brand Manager	Quality Assurance	c2c99d42-6aab-4af6-9f5f-1c9833d34799	Influencer Partnership	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.52865+00	2025-08-17 16:27:08.52865+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
fc0b81a6-fa60-4908-8cf3-8de83e8dac14	Jeffrey	Reed	Financial Controller	Business Development	35b59ce3-077f-4ea3-b57d-afc7b50e6613	Podcast Interview	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.530807+00	2025-08-17 16:27:08.530807+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
e37f65ad-05be-4afc-8306-4f59193e101d	Test	Contact	\N	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	2025-08-17 18:26:04.157638+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
4b6004c4-25aa-46da-b139-baeaabc6a9a0	Brian	Le	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	b202f2a9-13fe-41f1-be43-df14aa2001e0	2025-08-17 18:26:04.166707+00	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
751ac3d4-abfb-4e44-bb2e-5eb440e1a95c	Courtney	Cook	Tax Specialist	Project Management	64c5858d-837d-4ad3-9878-cf5d29e7dd56	Guest Blog Post	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.532739+00	2025-08-17 16:27:08.532739+00	\N	\N	ba774a5b-22b2-4766-b985-97548b2380dc
9c9bb2b9-6507-440f-b457-d38b6529626d	Jessica	Allen	Legal Counsel	Supply Chain	6c1effb0-40d8-4e3c-ad9a-1a80f7371bf6	Manufacturing Expo	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:52.953777+00	2025-08-15 08:22:52.953777+00	\N	2025-08-17 18:22:41.484795+00	b202f2a9-13fe-41f1-be43-df14aa2001e0
29553c5f-d1b7-496a-9ead-35bca0828582	Daniel	Clark	UX Designer	Legal	35b59ce3-077f-4ea3-b57d-afc7b50e6613	GitHub Profile	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.470279+00	2025-08-17 16:27:08.470279+00	\N	2025-08-17 18:26:03.706533+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
1f6e492f-9b7f-4c85-acd5-03f4682b432d	Nicole	White	Data Scientist	DevOps	c2c99d42-6aab-4af6-9f5f-1c9833d34799	Portfolio Website	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.467502+00	2025-08-17 16:27:08.467502+00	\N	2025-08-17 18:26:03.737931+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
48352803-58ef-4903-9e1f-a1ec4db775e9	Robert	Anderson	Senior Software Engineer	Engineering	446386c2-676b-47e4-bf0b-e05774eb791a	Trade Show	t	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.44684+00	2025-08-17 16:27:08.44684+00	\N	2025-08-17 18:26:03.772019+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
906b2085-d793-4d02-9003-e80e11d91950	Sarah	Johnson	Chief Executive Officer	Executive	35b59ce3-077f-4ea3-b57d-afc7b50e6613	Website Contact Form	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.43519+00	2025-08-17 16:27:08.43519+00	\N	2025-08-17 18:26:03.810558+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
b79fb2be-01b2-4a2b-b30b-0c48f3508e7a	Amanda	Taylor	Marketing Manager	Human Resources	08d8f3c1-53ff-4445-9832-a1b02b3e0a98	Social Media	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.453791+00	2025-08-17 16:27:08.453791+00	\N	2025-08-17 18:26:03.841557+00	8b531e80-6526-4d0c-93ce-db70cc2366ea
2eca6953-1955-4a82-9e1e-4ffb7a89a912	Andy	Wen	Manager	\N	\N	\N	t	f	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b	\N	7ed98e09-6460-49aa-8f9e-6efbe9ebffb7
\.


--
-- Data for Name: custom_field_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_field_definitions (id, tenant_id, entity_type, field_name, field_label, field_type, field_options, is_required, is_active, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_field_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_field_values (id, field_id, entity_id, entity_type, text_value, number_value, decimal_value, boolean_value, date_value, json_value, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_fields; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_fields (id, name, label, type, entity_type, is_required, is_unique, default_value, options, lookup_entity, validation, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: custom_objects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_objects (id, name, label, plural_label, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: deal_stage_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deal_stage_history (id, deal_id, from_stage_id, to_stage_id, from_amount, to_amount, from_probability, to_probability, from_currency, to_currency, from_expected_close_date, to_expected_close_date, change_reason, notes, moved_at, moved_by) FROM stdin;
\.


--
-- Data for Name: deals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deals (id, name, amount, currency, probability, pipeline_id, stage_id, expected_close_date, actual_close_date, company_id, contact_id, assigned_user_id, tenant_id, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: email_address_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_address_types (id, name, code, description, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
cf571e53-cc14-44cb-8a61-d195223ea970	Personal	PERSONAL	Personal email address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.466858+00	2025-08-15 08:15:49.466858+00	\N
03ee8151-fd6c-4d31-8b61-e9c8e786450b	Work	WORK	Work email address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.469286+00	2025-08-15 08:15:49.469286+00	\N
b4012606-e84f-4626-8544-144e1ed66a3b	Other	OTHER	Other email address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.472099+00	2025-08-15 08:15:49.472099+00	\N
\.


--
-- Data for Name: email_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_addresses (id, email, is_primary, is_verified, type_id, entity_id, entity_type, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
5128ac66-64fc-43d2-b6d8-b21f3b7cc644	sarah.johnson@acme.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	7eed624f-9925-4f80-9146-ae820be0e58f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.857339+00	2025-08-18 14:22:23.857339+00	\N
2a2ec7d6-d2c9-4b01-b01f-3cfb6ae96194	andy@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	2eca6953-1955-4a82-9e1e-4ffb7a89a912	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
de206c56-7166-4e39-82fe-e04eaa66a193	a@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	78181568-b3e1-4765-a657-38ccecc3bf26	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
8f9d740c-cef0-429a-8665-6b212a67d87b	a@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	abb14855-358b-457e-9499-e069ceffc550	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
b139a2db-106d-4230-8d62-c9b4e66a9067	b@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	8e678b0a-06cb-4b34-8a09-1a4542408ad8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
93699e30-d6ce-4387-9353-35f850c7e94c	b@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	80a691c5-750a-4b85-a070-956fbb0bcc12	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
6d06b85c-aed5-4d81-85ac-ff6e10eabde7	a@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	26989bab-7b6a-46c0-bf60-daf49dd2fe30	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
9bc9dfaa-7e37-4390-beb9-8ee8d4d93a7d	johnsmith719@hotmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	0bf8c763-2842-49b2-b0e9-4a26ec1735c4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.572429+00	2025-08-17 13:44:22.572429+00	\N
e3d272c5-8920-49d9-96ed-c0e7cc987cf7	john.smith@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	0bf8c763-2842-49b2-b0e9-4a26ec1735c4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.575392+00	2025-08-17 13:44:22.575392+00	\N
2e008f7a-9b1d-42fc-b630-804ba8155ea1	sarahjohnson729@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	79644c52-cd25-4489-800c-04a89d7a7861	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.586992+00	2025-08-17 13:44:22.586992+00	\N
8d2666c6-5935-468c-b358-1ce0fdfb14ca	sarah.johnson@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	79644c52-cd25-4489-800c-04a89d7a7861	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.589872+00	2025-08-17 13:44:22.589872+00	\N
20ecc58c-f5b5-4f95-bbbd-8aa5164b53c7	michaelbrown@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	b52e1ec2-72b9-4daa-a152-e51c18212248	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.598471+00	2025-08-17 13:44:22.598471+00	\N
ecbaa327-92ab-4a5d-859d-7159dbc84442	emily.davis@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	f3975c04-6a1d-424a-a98e-a88199b671b3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.603131+00	2025-08-17 13:44:22.603131+00	\N
eec774a6-9441-42b0-a1e9-d044c88e8762	davidwilson572@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	a53a16e5-cb11-4d7a-899b-f9e71e88bf9d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.612229+00	2025-08-17 13:44:22.612229+00	\N
aeb2fbef-c3d0-4d41-bb80-41c53483cf3b	lisa_anderson@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	b8702a2e-e0f1-4176-8419-27442c0be258	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.616533+00	2025-08-17 13:44:22.616533+00	\N
f38a228c-6e64-42c0-b946-f44663427f31	lisa.anderson@company.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b8702a2e-e0f1-4176-8419-27442c0be258	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.618301+00	2025-08-17 13:44:22.618301+00	\N
28acf48a-138d-4fe5-ab0d-018362555e25	robert.taylor@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	455654b8-8ed2-4c6b-9988-4ff53f1c9ebe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.626454+00	2025-08-17 13:44:22.626454+00	\N
9c95dd5b-cdaf-4ab5-83db-d269982d5abf	jennifermartinez267@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	2b918485-ff1a-422c-9066-4a29beca5fb1	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.632112+00	2025-08-17 13:44:22.632112+00	\N
92bc5348-ecda-432a-93c1-dea8b605a486	christophergarcia@yahoo.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	87e258c1-c9eb-4c70-8fc6-22089060885d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.636415+00	2025-08-17 13:44:22.636415+00	\N
110e7eab-66d2-40cf-9141-1116ee38cf58	christopher.garcia@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	87e258c1-c9eb-4c70-8fc6-22089060885d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.640169+00	2025-08-17 13:44:22.640169+00	\N
2377aff9-6f2d-4702-9b72-041a48232a67	amandarodriguez@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	f8b962a2-4cc9-47e3-9e22-9db5f797c95f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.646874+00	2025-08-17 13:44:22.646874+00	\N
04c5086d-3d41-4506-9efa-caf9fb911248	amanda.rodriguez@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	f8b962a2-4cc9-47e3-9e22-9db5f797c95f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.648759+00	2025-08-17 13:44:22.648759+00	\N
5270afe7-ee86-4ddb-aa0c-76279dc3ae21	james_lee@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	f10d7250-7b11-4fd8-b79a-5c1db9f46cc6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.653199+00	2025-08-17 13:44:22.653199+00	\N
65769d80-cf0f-4fcc-8948-6094200ebfcc	alex.turner@acme.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	48434ee4-b741-492a-81f3-91519de02819	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.865936+00	2025-08-18 14:22:23.865936+00	\N
f91d93f1-cbb3-41ed-b12c-78bb45e0ac2e	maria.gonzalez@acme.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a524b0ac-d7ab-4a84-a018-1b9da0151d15	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.874584+00	2025-08-18 14:22:23.874584+00	\N
0225ba11-3714-43a0-b867-e818dd57b415	daniel.kim@acme.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	0df6cdfd-8f89-45ec-97c1-8a064eb59d7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.882053+00	2025-08-18 14:22:23.882053+00	\N
c077093b-b858-4a93-85ea-4ef1f94a2254	michelle.white@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	5417330b-bb97-44d5-9854-128d4ad23cc0	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.659283+00	2025-08-17 13:44:22.659283+00	\N
228ddcf0-c881-450b-af6d-3c041d310f12	michael.chen@globaltech.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	3e27031f-244c-43fd-b56e-257693adfa93	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.894648+00	2025-08-18 14:22:23.894648+00	\N
d624e325-ce2f-49ec-ada9-49f1c4526c9b	alex.turner@globaltech.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	09e37143-1951-4511-8f1f-3aac3bad777e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.904295+00	2025-08-18 14:22:23.904295+00	\N
8d0e08e3-abf8-4023-a1f4-a34938fd5d69	maria.gonzalez@globaltech.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	75a13a2a-9045-490e-a359-b597bf5aee59	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.910721+00	2025-08-18 14:22:23.910721+00	\N
e89ea482-9ef8-4cd0-bc23-6b09e0231f51	daniel.kim@globaltech.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	9c5f4ad2-4e14-4869-bb4c-fcefbf412421	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.918037+00	2025-08-18 14:22:23.918037+00	\N
9a1b231c-f9b0-4bce-b01d-29ad44b4d990	emily.rodriguez@meridianhealth.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	f621f36e-7519-4b45-9722-f6afb1e1b2d4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.927894+00	2025-08-18 14:22:23.927894+00	\N
51e5db0e-43ee-4891-8b36-92a173bea7e6	alex.turner@meridianhealth.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	e5c1ea2b-953d-4a36-9259-2d9f67990727	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.935688+00	2025-08-18 14:22:23.935688+00	\N
cec6bc8a-813f-4f85-aa69-418b3b5881f3	maria.gonzalez@meridianhealth.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	06a27fba-d6d1-4181-a8e6-504ccb8c18dd	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.942779+00	2025-08-18 14:22:23.942779+00	\N
84e53d8d-f79a-4b56-ac57-db72057f120c	daniel.kim@meridianhealth.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	2fa04312-6fdf-48ef-b97b-4140d71aa371	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.949632+00	2025-08-18 14:22:23.949632+00	\N
d76fc29f-bebd-4bca-993e-474a4cc02f0e	david.thompson@summitfinancial.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	0aa76ff6-c0ff-42be-aba5-dc6675822269	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.959631+00	2025-08-18 14:22:23.959631+00	\N
f8f90e3a-368d-45d7-bce1-7d17b1c994dd	alex.turner@summitfinancial.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	020f0aea-f3e4-440c-a460-e07a253a213f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.965982+00	2025-08-18 14:22:23.965982+00	\N
f59ceabf-1fc1-4634-aeed-4765d4911e75	maria.gonzalez@summitfinancial.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	c208a55d-bcfb-4722-b5f6-b3d734b55fda	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.975024+00	2025-08-18 14:22:23.975024+00	\N
bf098ff1-aae9-45c8-a1f2-4bc6ba0edbf8	daniel.kim@summitfinancial.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	4662ccd3-31b9-4af0-9a95-451120024bb8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.983817+00	2025-08-18 14:22:23.983817+00	\N
ede41952-6b5b-49cc-8de2-b05dd337651d	lisa.wang@precisionmfg.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	81c00860-f07b-4d75-a3fc-06c4d811151f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.994072+00	2025-08-18 14:22:23.994072+00	\N
4b6f8302-a2b8-4aad-8890-2faa189afca6	alex.turner@precisionmfg.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	e0bc6b84-16f9-4c0c-9b6e-686b5f97bde3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.003186+00	2025-08-18 14:22:24.003186+00	\N
1438da09-4d18-4a68-9cc0-22b448502b1f	maria.gonzalez@precisionmfg.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	7b58e1a4-a308-4c03-945a-638be63fd87f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.00949+00	2025-08-18 14:22:24.00949+00	\N
aca37ee4-c49e-479b-808c-af7191ed47d2	daniel.kim@precisionmfg.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	f2226b9e-de07-44ea-a765-44d296f9eac6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.017331+00	2025-08-18 14:22:24.017331+00	\N
dc6cdf96-dc1f-4a02-a381-035970370661	james.wilson@urbanretail.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b184b112-eb53-484d-ac9d-b02e9b731845	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.027159+00	2025-08-18 14:22:24.027159+00	\N
7804c364-2fab-4bfa-a64b-ae09f0a170f1	jennifer.davis@nexusconsulting.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	2b1b3817-65a1-4899-b31e-cc4a16a1569d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.038669+00	2025-08-18 14:22:24.038669+00	\N
391ce5b3-2bd4-4fdb-a2c3-029291b75c8c	robert.brown@bluehorizon.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	0ac551ec-5265-40ba-bb3e-089488d0f3ff	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.047495+00	2025-08-18 14:22:24.047495+00	\N
856c7182-5ea6-4722-957c-7448a22b27be	alex.turner@bluehorizon.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	c0d318cd-d5ae-4e16-ad0c-bfe6058d12e0	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.056182+00	2025-08-18 14:22:24.056182+00	\N
6b3ba1b0-0f92-487c-9357-e0aee5d42564	maria.gonzalez@bluehorizon.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	2a202130-6cc6-433b-a6f6-b03191c6c6bc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.06529+00	2025-08-18 14:22:24.06529+00	\N
15b968f4-7943-4034-a1a0-0ff5364ba904	daniel.kim@bluehorizon.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	ecfb1de9-991e-4e5d-bce1-482f0aa7333a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.073058+00	2025-08-18 14:22:24.073058+00	\N
3bf3b6bd-1589-4c41-b97b-06db4f942c62	amanda.garcia@silverlining.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	4f618057-25ed-4470-874d-7aa321803990	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.082804+00	2025-08-18 14:22:24.082804+00	\N
412e491a-fc51-4964-bdba-107f86c47742	christopher.lee@greenearth.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	ebd8f8ff-535f-4198-b946-38862419a922	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.093355+00	2025-08-18 14:22:24.093355+00	\N
a3067377-bc84-4d5e-ab90-e876b020a68f	danielthompson780@hotmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	6cc01ce7-f735-45c6-9482-8f85001ae6b9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.667553+00	2025-08-17 13:44:22.667553+00	\N
cc6de870-56e3-474a-b5bb-a1535059b045	info@company.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	e124301d-e9af-42c1-a361-0c0882547f7a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.250028+00	2025-08-18 18:01:56.250028+00	\N
0be88d9e-99f2-4186-aaf3-7e82f0356c50	info@ventures.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b5de6862-01e7-4e04-a831-3dfe95563c9c	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.256672+00	2025-08-18 18:01:56.256672+00	\N
e35e527d-6a9c-4496-91a0-bb399ee15912	info@partners.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	7d89c2bd-9fd9-4bf2-b5f9-644e244afe65	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.261539+00	2025-08-18 18:01:56.261539+00	\N
87bc427d-c13a-4fa4-8eb6-6f3b9dfaff25	info@associates.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	6b2e822a-b5c8-480d-ac5e-7a3e0ec78e98	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.26641+00	2025-08-18 18:01:56.26641+00	\N
5b536b9d-fc6f-42cb-b67f-d4633f9422db	info@holdings.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	8152c747-c080-46cb-86a4-730ef9e79f7b	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.271379+00	2025-08-18 18:01:56.271379+00	\N
11482685-11c4-4eb9-8e3c-b1fcab35ad94	info@group.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	cc5c3527-dc17-48b7-830e-c24d5378861a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.276125+00	2025-08-18 18:01:56.276125+00	\N
f9f8100c-7c54-467d-b901-6081c56e6fe6	info@partners.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	30d8b0b0-2d20-427f-a456-f261f662ba99	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.280445+00	2025-08-18 18:01:56.280445+00	\N
b5b1182b-8d44-4a3d-bae0-49e09bf87d60	info@partners.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	82394f79-e8ee-41c9-94bf-1ff2acad6975	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.284936+00	2025-08-18 18:01:56.284936+00	\N
84fe82c3-48af-444d-b0e0-0eb8344a2680	info@associates.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	91ebf292-9cfc-494d-957e-ee34f9137fec	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.289153+00	2025-08-18 18:01:56.289153+00	\N
50836de1-9b55-4365-9858-cabc81f108c3	info@corp.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	570512eb-aabf-42b9-b485-3df0effee807	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.293342+00	2025-08-18 18:01:56.293342+00	\N
6f81834c-4786-420c-9211-87fd8f242ea8	info@enterprise.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	af5e910f-9054-4c3f-b509-c3815aaade72	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.297767+00	2025-08-18 18:01:56.297767+00	\N
980b3064-3bc0-4f5b-a566-eb953e66504d	info@firm.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	e8849080-2368-478d-b4ce-b87ebd7974b2	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.302204+00	2025-08-18 18:01:56.302204+00	\N
63b9cd92-d69d-4863-b364-d9b957a16e4e	info@business.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	e23a12d3-3380-4918-ac31-39bfe80a8211	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.306519+00	2025-08-18 18:01:56.306519+00	\N
4113d620-b82f-4a90-93fc-1588eb627ece	info@holdings.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	50ea3d2c-f3e3-4460-ad34-49bdb87a325a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.310721+00	2025-08-18 18:01:56.310721+00	\N
5112c921-f78a-43b7-8ab5-c03530d06bbb	info@company.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	04ba9ed7-7b34-4442-9fae-6367d79481cf	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.314741+00	2025-08-18 18:01:56.314741+00	\N
7021f610-1c55-405b-aca8-0dde97ad841f	info@company.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	d6d87d98-9660-4cfc-85c0-2e2df0ebe0e9	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.319181+00	2025-08-18 18:01:56.319181+00	\N
84a368bf-6a62-4b5f-801d-ef1d3bd72c61	info@business.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	ec4f7848-824e-4fb6-9551-ea1473dcfb3f	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.324177+00	2025-08-18 18:01:56.324177+00	\N
3d5d99b9-5f67-4ad3-8500-15a0c7ac56b3	info@corp.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	ca85637b-3852-444f-af3f-a42b032191be	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.329386+00	2025-08-18 18:01:56.329386+00	\N
ded0605b-4efa-4c03-beec-a4a1e13b6f80	info@firm.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	7c7644ee-cb23-4dfb-8ed5-39edae86c278	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.333868+00	2025-08-18 18:01:56.333868+00	\N
e5b7b950-3f40-4ccb-bc09-8f6479853e3f	info@ventures.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	6c1effb0-40d8-4e3c-ad9a-1a80f7371bf6	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.338004+00	2025-08-18 18:01:56.338004+00	\N
76763ca2-16d1-4775-8a7c-06e80ad9ad56	info@firm.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	9dc9056f-a165-4002-a9a6-552dd5305f7a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.341891+00	2025-08-18 18:01:56.341891+00	\N
02fa0bb9-61f2-4e5a-80c9-5435def5c007	info@corp.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	005fd3c7-3b66-4d04-a14f-c719a3147f1d	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.345942+00	2025-08-18 18:01:56.345942+00	\N
a01447a3-4795-4aeb-b988-7ed20691dd1e	info@ventures.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a438d48a-ee50-448e-852e-7a7d4d5c704b	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.350277+00	2025-08-18 18:01:56.350277+00	\N
7806a16d-8eac-4fff-ab77-5802caa73300	info@ventures.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	216032e1-d6c7-4a1f-a012-08c08b627b8d	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.354459+00	2025-08-18 18:01:56.354459+00	\N
736186e2-bf0d-49ea-a6ab-ae045fc1ecef	info@corp.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a8eb5b3c-2efc-40f7-b64b-e05ce198507d	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.358504+00	2025-08-18 18:01:56.358504+00	\N
8b7d7d5d-ac00-4918-8517-c452d537a09f	info@enterprise.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	139e04fa-bdec-43d5-bb91-2848815d7a07	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.36276+00	2025-08-18 18:01:56.36276+00	\N
800f99a3-5ae0-4a95-8f2f-064d652322d1	info@associates.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	63ac9507-3b40-4410-96f6-deaf949d8aa9	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.36687+00	2025-08-18 18:01:56.36687+00	\N
04541645-ac17-4668-8fdc-be2f035241b5	info@business.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	ea6652d1-dbd5-4bee-a831-60b6aacd706a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.371866+00	2025-08-18 18:01:56.371866+00	\N
604df0ae-80e9-4ee8-9282-4596485cb932	info@holdings.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	be65e1b5-8ce7-4426-b5f8-1625321a854c	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.376304+00	2025-08-18 18:01:56.376304+00	\N
8fc49595-f867-4b54-b887-007f9948ba81	info@partners.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a3933216-7f83-41aa-953a-c805b5c47789	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.38027+00	2025-08-18 18:01:56.38027+00	\N
2fcaef04-3b1b-46ab-ba44-5c1cd2ad0f91	info@associates.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	cfca2e1f-8426-47f9-b582-07400862bd4c	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.385154+00	2025-08-18 18:01:56.385154+00	\N
d202cd63-7f81-40ad-b56a-5063f257e37b	info@firm.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	35b59ce3-077f-4ea3-b57d-afc7b50e6613	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.390387+00	2025-08-18 18:01:56.390387+00	\N
7605a637-389b-483a-8b70-2db7e20fcb36	info@partners.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	64c5858d-837d-4ad3-9878-cf5d29e7dd56	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.396177+00	2025-08-18 18:01:56.396177+00	\N
d50694c7-9a3a-4ff2-bc9c-231fc682443c	info@holdings.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	01be7874-0098-4ec5-9d48-9393ca57bc98	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.402604+00	2025-08-18 18:01:56.402604+00	\N
e9809d41-81fd-456b-8a1a-6f40c377cb0f	info@firm.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a94483dd-5541-4a47-a4ff-7fca34c3c0dc	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.406916+00	2025-08-18 18:01:56.406916+00	\N
989c9410-76f5-4b73-badd-f2af1596d2ea	info@associates.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	1f8f16a7-3562-4df8-bbdc-a0e4b6e14cee	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.412458+00	2025-08-18 18:01:56.412458+00	\N
49c1580c-ae7c-473e-90b4-f731eb719c5b	info@partners.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	446386c2-676b-47e4-bf0b-e05774eb791a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.417414+00	2025-08-18 18:01:56.417414+00	\N
50d5eb71-e457-4cda-af06-8ab87fffb8ce	info@corp.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	88463116-9630-499e-8ae9-76aeacf2851f	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.422592+00	2025-08-18 18:01:56.422592+00	\N
9c4fedf6-c4cf-4c9b-8ca0-3e19a40020c2	info@ventures.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	233915d4-3561-4a96-b8f4-539aee58d54a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.427027+00	2025-08-18 18:01:56.427027+00	\N
224333a1-6b66-43d4-981a-5249126aaf8e	info@enterprise.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	08d8f3c1-53ff-4445-9832-a1b02b3e0a98	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.430944+00	2025-08-18 18:01:56.430944+00	\N
2484cca1-c34c-4fe8-b6c1-c9950770e5ce	info@enterprise.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	4ccc9467-319f-468b-9b6a-ce29a5195ed6	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.435787+00	2025-08-18 18:01:56.435787+00	\N
f63264e1-f1ad-4279-95d9-ec6b94e96906	info@business.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	f95d5433-17a8-4a25-8a87-dfad8ac5793d	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.440874+00	2025-08-18 18:01:56.440874+00	\N
a69a20c4-975d-4d31-b764-9e2c58fce716	info@business.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	c920fe2a-7619-46cf-80cd-18d08eceba2b	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.445215+00	2025-08-18 18:01:56.445215+00	\N
31d9a374-dcc7-49c1-aa66-7022298a7cc8	info@holdings.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	1de20cb2-4b55-4a4d-9eba-f10e78c4e09f	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.450154+00	2025-08-18 18:01:56.450154+00	\N
c7a9ec30-bb3a-47db-8ca1-aa4a43474aa2	info@holdings.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	6d8cd793-a016-4ab7-9b39-b65b6aaecd0e	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.457034+00	2025-08-18 18:01:56.457034+00	\N
afe0e949-30df-43dd-a776-dbe9df0c6776	info@partners.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	c2c99d42-6aab-4af6-9f5f-1c9833d34799	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.463031+00	2025-08-18 18:01:56.463031+00	\N
7036656e-2d11-4b3c-9c9d-bb308196b5b1	info@firm.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	d0f76f75-3ae1-4cdd-9992-834dd2c73352	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.467323+00	2025-08-18 18:01:56.467323+00	\N
7ac8dc5b-ca00-43a5-a38d-b91ac54e62f8	info@group.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	44559722-1c94-4a08-a4ca-e261232fc1dc	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.471624+00	2025-08-18 18:01:56.471624+00	\N
8578dd34-1f32-4d0f-99fb-4d53186dd26b	info@company.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	79920099-87c1-4d41-a729-e0d094024b16	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.477177+00	2025-08-18 18:01:56.477177+00	\N
3567b4f9-2570-423c-ad94-df565275a192	info@associates.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	cf8480e6-4b3d-4019-8609-55d1c281f9da	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.483415+00	2025-08-18 18:01:56.483415+00	\N
6ffe9599-7a3f-4f11-9005-911454b947ab	info@ventures.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	63b90681-c4e2-4cbb-befc-fa91dff784ff	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.487751+00	2025-08-18 18:01:56.487751+00	\N
7feeb2f8-9570-4558-801a-c924d10f2806	info@corp.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	34021023-0fb6-4c0d-9bcd-d6837527fbeb	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.491925+00	2025-08-18 18:01:56.491925+00	\N
704ca42f-3a9b-4ce8-a786-1bc83002b8ba	info@ventures.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	3a794c42-3fba-4420-9429-e8f748b8df62	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.497471+00	2025-08-18 18:01:56.497471+00	\N
7aea9c93-3ffa-4c8c-a950-fa97a78566da	info@company.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	9c4b0c2c-a0c0-4a83-b3e0-a49720c81efa	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.502357+00	2025-08-18 18:01:56.502357+00	\N
4fa98471-d1ed-4225-80f5-cd69ad8ba7e4	info@ventures.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	5dd6c10e-e69f-4605-af41-15a4bfcd08b9	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.506667+00	2025-08-18 18:01:56.506667+00	\N
091c1015-d5ac-4e85-977a-dffab6a3b91a	info@enterprise.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	6e29d6c2-227a-4659-8e7c-dd92252ab48e	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.511828+00	2025-08-18 18:01:56.511828+00	\N
2e630904-3c6a-40bf-884e-504b36a62a2d	info@business.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	57067e69-33eb-49da-aa15-16734a81c54c	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.516476+00	2025-08-18 18:01:56.516476+00	\N
132ec519-26c1-498c-8e77-761159e16d48	info@company.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	e1610917-e0ac-4ca7-b679-41f9fd999ede	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.521634+00	2025-08-18 18:01:56.521634+00	\N
7507f50f-7012-4701-90b7-142d4c18e764	info@holdings.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	6ebdf198-7536-4165-a182-8662e0669bcc	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.525582+00	2025-08-18 18:01:56.525582+00	\N
6baa7329-b272-4233-8bd2-fd5f2a99c724	info@business.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	cf676777-5028-4d3b-b495-86915b78be21	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.530131+00	2025-08-18 18:01:56.530131+00	\N
a983520c-5af4-46e8-9f32-4e4af324a02a	info@group.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	c22d69b8-2733-47dc-804d-fa156cb38bc2	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.534936+00	2025-08-18 18:01:56.534936+00	\N
025d12ec-3665-4689-a764-621515318e3e	info@group.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	2a130244-b3f6-4edd-b3e6-d3f17c4e386f	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.540759+00	2025-08-18 18:01:56.540759+00	\N
8481a19e-c69d-4c13-afd6-41e9480fed19	info@associates.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	4774668c-86f8-47cf-b14d-9812528d4174	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.545172+00	2025-08-18 18:01:56.545172+00	\N
79bcda15-6295-411a-b7ca-4c029d01dcfc	info@partners.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	215d54e5-9d5b-4afd-8491-6e6d627b29e2	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.552339+00	2025-08-18 18:01:56.552339+00	\N
2d21a68b-8f2c-45de-8d5f-c7a7124d36b6	info@enterprise.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	7e2eaea8-3dbb-46f4-a4f1-f6fa806ad4b9	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.55827+00	2025-08-18 18:01:56.55827+00	\N
60a6a043-779a-4678-a030-713d656bee61	info@enterprise.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	25365980-21fe-4da6-a1c8-2276fcc5510c	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.563389+00	2025-08-18 18:01:56.563389+00	\N
1080c539-83de-418a-883d-48fd2d300dc9	info@holdings.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	74b78071-20e8-4771-ac54-0b2972cac756	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.567667+00	2025-08-18 18:01:56.567667+00	\N
1ef27e37-e6aa-4a97-9e8a-a983f0a21df3	info@enterprise.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	5ec46438-0ab7-4d27-81c4-1c59a869ae20	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.574324+00	2025-08-18 18:01:56.574324+00	\N
12bb4dc6-6db0-49c0-b709-8ec9202138f0	info@partners.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b8a09f47-b6dc-4d26-b0dc-d3104966cb47	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.579239+00	2025-08-18 18:01:56.579239+00	\N
e2e60e60-f058-452f-a60a-cd6dfc5b9078	info@firm.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	46d2fb0a-b266-4519-b5d2-24ee89607cdc	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.583256+00	2025-08-18 18:01:56.583256+00	\N
30e95f7a-b74c-4f6c-b2d6-0ef17688d5bf	info@ventures.com	t	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	276a631e-5c76-4110-a21d-6a565caf3a5b	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.588813+00	2025-08-18 18:01:56.588813+00	\N
92d6e7eb-9897-4dee-9e9d-ba8a42b2f6da	jessicaclark496@hotmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	7c3cc563-ccc8-4efb-b40b-c63e0fa45cc3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.672501+00	2025-08-17 13:44:22.672501+00	\N
ab619b0b-9387-4835-9dd0-dc3a49a27c88	jessica.clark@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	7c3cc563-ccc8-4efb-b40b-c63e0fa45cc3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.674732+00	2025-08-17 13:44:22.674732+00	\N
28f676d0-1ddd-4074-b6bd-f9712e2f9c92	matthewlewis11@icloud.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	ea07c16d-f103-4381-8004-c7397487fd41	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.680855+00	2025-08-17 13:44:22.680855+00	\N
b97b68a1-2c46-42f1-93ff-4cb3753bf579	nicolehall185@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	661d7e5f-1697-412d-94dd-28fb861173dc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.687041+00	2025-08-17 13:44:22.687041+00	\N
c7b787d9-0a9a-456c-93de-25f2cac6729d	andrew.young@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	35bbc30a-769d-4998-9801-0c5597357d16	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.694717+00	2025-08-17 13:44:22.694717+00	\N
c7d98d3d-d39a-4bfc-bff0-aa87bf0e6cfd	andrew.young@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	35bbc30a-769d-4998-9801-0c5597357d16	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.696462+00	2025-08-17 13:44:22.696462+00	\N
1177d502-db20-4ce6-b79a-c02fdfe44e8f	stephanie_king@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	9bc72c9f-cd34-40df-94e1-58b980d318c6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.702358+00	2025-08-17 13:44:22.702358+00	\N
560bdd8f-26fe-4564-a20a-b1c1080e4d6a	kevin.wright@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	4b967856-c128-40ae-8e5d-7b3ed7c2f39e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.709869+00	2025-08-17 13:44:22.709869+00	\N
ed155980-d7a7-4369-9dad-645bcdb7dd0b	kevin.wright@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	4b967856-c128-40ae-8e5d-7b3ed7c2f39e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.711695+00	2025-08-17 13:44:22.711695+00	\N
76268d3b-0e56-4186-a07c-1ddbd5a38a48	rachellopez592@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	d5357fc4-34c7-4ed0-921b-71079274851c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.717478+00	2025-08-17 13:44:22.717478+00	\N
bb578b7d-537d-4e39-a5bd-45ce0e4170a0	sarah_johnson@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	39ffe7b8-133f-4c18-82c4-6a6d9163f5e4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.723059+00	2025-08-17 13:44:22.723059+00	\N
9a473178-4c59-4ac8-a485-a770ab2e9db9	michaelchen@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	c835bac7-9ab5-4fc6-97a2-81d8d91b908a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.729474+00	2025-08-17 13:44:22.729474+00	\N
2f7b6e2b-5e7c-42ef-a7e3-2a7395c003be	michael.chen@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	c835bac7-9ab5-4fc6-97a2-81d8d91b908a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.73135+00	2025-08-17 13:44:22.73135+00	\N
296af22d-372f-4109-95f6-5410a9307998	dr. emily.rodriguez@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	45582b4d-b0e3-48e4-b8e3-958de0648580	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.740206+00	2025-08-17 13:44:22.740206+00	\N
477357db-f4ed-40c1-97a1-8f450bd4066b	dr. emily.rodriguez@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	45582b4d-b0e3-48e4-b8e3-958de0648580	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.742415+00	2025-08-17 13:44:22.742415+00	\N
8b8ba97a-a680-4f99-8a3d-a4188283a1d1	davidthompson@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	d612c904-77a1-42e9-8e0b-71ba452fa196	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.746584+00	2025-08-17 13:44:22.746584+00	\N
eedaca18-6f3c-4a5b-a5ee-76b5ebc74284	david.thompson@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	d612c904-77a1-42e9-8e0b-71ba452fa196	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.748528+00	2025-08-17 13:44:22.748528+00	\N
c3a946eb-87b7-487a-97e5-a798a0294183	lisa_wang@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	d6409070-9d3f-4474-a3ff-fff2adbf0e42	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.753261+00	2025-08-17 13:44:22.753261+00	\N
e02b024b-567e-44c4-8532-560e911407ee	lisa.wang@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	d6409070-9d3f-4474-a3ff-fff2adbf0e42	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.755631+00	2025-08-17 13:44:22.755631+00	\N
72fb052b-96c1-4040-bff2-9b62e5b0ab94	robert_anderson@icloud.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	a42da5d5-9f01-4225-b45a-d6dac56f3fe5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.762559+00	2025-08-17 13:44:22.762559+00	\N
4aa1ffd2-4088-47be-abc3-0cd334aa2dae	jennifer.martinez@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	2e2350ec-2863-41d0-bea7-210e82e5dafa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.76653+00	2025-08-17 13:44:22.76653+00	\N
79f96a09-bb47-4670-b977-c3d52d2dd046	jennifer.martinez@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	2e2350ec-2863-41d0-bea7-210e82e5dafa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.768251+00	2025-08-17 13:44:22.768251+00	\N
be41b2b5-d65c-483d-abcd-b502e918ccdf	jameswilson@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	898e3e0c-3be0-4f87-9f62-9157c2e70a3d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.775665+00	2025-08-17 13:44:22.775665+00	\N
b43297b6-c79a-4cd6-a089-99d8bd446af4	james.wilson@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	898e3e0c-3be0-4f87-9f62-9157c2e70a3d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.777692+00	2025-08-17 13:44:22.777692+00	\N
dcefac84-6b87-41f6-b712-c05af5238f56	amandataylor949@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	0437461a-1672-4eee-ad3a-af42eae66a89	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.781674+00	2025-08-17 13:44:22.781674+00	\N
57edcf1f-854a-41e5-b84f-01ccbae97357	amanda.taylor@company.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	0437461a-1672-4eee-ad3a-af42eae66a89	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.783332+00	2025-08-17 13:44:22.783332+00	\N
1932389c-0252-4d29-9b71-6fc6e83f88a2	christopher.brown@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	df3c4ded-67fa-4cc2-8f04-f8a7d91e41f6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.791435+00	2025-08-17 13:44:22.791435+00	\N
356e416e-ee1e-45ff-9b3b-1f708b111cb8	mariagarcia@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	f14577df-3f7b-4df5-93e4-1091ca3d8cdf	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.797591+00	2025-08-17 13:44:22.797591+00	\N
ca5d5e6a-99ea-4b4b-8cbb-8146b315d315	maria.garcia@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	f14577df-3f7b-4df5-93e4-1091ca3d8cdf	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.799255+00	2025-08-17 13:44:22.799255+00	\N
7d58ad64-d8eb-425d-9260-c924047a6766	kevin.lee@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	c2541b4e-5ea0-4e78-8bfb-b1d801ca1f3b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.807768+00	2025-08-17 13:44:22.807768+00	\N
78a191af-28f1-41d3-8e63-8670f25d3f98	kevin.lee@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	c2541b4e-5ea0-4e78-8bfb-b1d801ca1f3b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.810139+00	2025-08-17 13:44:22.810139+00	\N
1dd8fe6c-61ba-488c-8e6b-c72501a88778	racheldavis980@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	090c8640-8c9f-4fbc-a0c7-7cb0691f1f71	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.814063+00	2025-08-17 13:44:22.814063+00	\N
4ebc2e33-0123-41ce-9ae1-798bb9edf2c8	rachel.davis@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	090c8640-8c9f-4fbc-a0c7-7cb0691f1f71	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.815736+00	2025-08-17 13:44:22.815736+00	\N
85fba204-0ea7-4cdb-93c4-5aeee15e8b7d	thomas_miller@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	44802c21-4411-42de-ac6d-4026dc903cf5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.822024+00	2025-08-17 13:44:22.822024+00	\N
58b348a7-8920-48ca-a524-8bf00307f695	nicolewhite@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	fe86be0d-4c6e-4a05-b069-4d3b5ecec67d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.82679+00	2025-08-17 13:44:22.82679+00	\N
baaf5ae7-2829-4c7b-9bd6-e91770e7e72f	nicole.white@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	fe86be0d-4c6e-4a05-b069-4d3b5ecec67d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.828639+00	2025-08-17 13:44:22.828639+00	\N
9f8c3c28-3c3a-43fa-bcef-9a1bbf23bce3	daniel.clark@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	e07c45ab-86f7-4bc1-9791-64f470254f1b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.833058+00	2025-08-17 13:44:22.833058+00	\N
942fc369-b7f0-4ba9-bdc4-94d59e45942d	daniel.clark@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	e07c45ab-86f7-4bc1-9791-64f470254f1b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.834827+00	2025-08-17 13:44:22.834827+00	\N
4e4d5cb0-30ff-4116-a34e-802011f6d2d6	stephanielewis@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	2565104e-5573-49f8-b4dc-45373ef0982f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.842309+00	2025-08-17 13:44:22.842309+00	\N
17c0f757-480a-4fee-a69d-6ba1cf2a6d02	andrew_hall@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	af50ec3f-7d3d-473f-ae9f-c18554eb1043	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.846479+00	2025-08-17 13:44:22.846479+00	\N
a1246bdb-d696-42d2-8907-c1ac2552e628	jessica.allen@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	90ac4fe8-2cf9-4d75-be83-1ef8d753e9a6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.852075+00	2025-08-17 13:44:22.852075+00	\N
54d3f063-bfde-40d1-acef-459a722b1ef2	jessica.allen@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	90ac4fe8-2cf9-4d75-be83-1ef8d753e9a6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.85414+00	2025-08-17 13:44:22.85414+00	\N
76bcde9e-e0cd-444b-963c-e5452e0d8246	ryan_young@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	4a5649ec-3678-4185-adbd-1b6783e54b1b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.860736+00	2025-08-17 13:44:22.860736+00	\N
baff3157-8925-4643-a57a-7ee6942a8515	ryan.young@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	4a5649ec-3678-4185-adbd-1b6783e54b1b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.862439+00	2025-08-17 13:44:22.862439+00	\N
ad454b9e-7394-42aa-a743-df71dbc16e2b	test@example.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	b1341729-7ed9-4d0f-94a0-f22777102ca6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
59f8fc3c-ad39-4f28-84e5-e50fcc4cc1b4	noowner@example.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	850814ac-df49-4c86-95f5-4656951822a1	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
b6539f69-5bb5-4475-9677-767e0bcdce50	michaelchen492@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	1899a533-5d7b-4e0c-acde-5a26d519f8fb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.874185+00	2025-08-17 13:44:22.874185+00	\N
52abbb3d-06b4-442d-af01-913a29b027a5	michael.chen@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	1899a533-5d7b-4e0c-acde-5a26d519f8fb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.8772+00	2025-08-17 13:44:22.8772+00	\N
44978387-e905-4140-a2ca-020daefe7851	dr. emilyrodriguez416@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	b7c18cc6-85ac-4800-905f-6e06009b2faa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.881511+00	2025-08-17 13:44:22.881511+00	\N
d4d712f2-a074-4873-ad18-6b5deb52e1a8	dr. emily.rodriguez@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b7c18cc6-85ac-4800-905f-6e06009b2faa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.883222+00	2025-08-17 13:44:22.883222+00	\N
3a353041-6f1a-4f76-b79a-aee0bee71678	david.thompson@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	12009684-90ba-48ac-aaff-68b85898b876	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.890435+00	2025-08-17 13:44:22.890435+00	\N
8e3bc4ad-24db-4c1a-bf61-d0be4d6ec2cf	lisa.wang@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	65f26e41-b1d2-42a4-b865-0184d0a253ef	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.894978+00	2025-08-17 13:44:22.894978+00	\N
1ebfedaa-af9b-4f79-9754-87fae52e232e	lisa.wang@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	65f26e41-b1d2-42a4-b865-0184d0a253ef	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.897309+00	2025-08-17 13:44:22.897309+00	\N
aa4c814c-9a2f-44d0-8398-14874c299771	robert_anderson@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	51d57c02-0cad-43ab-b5f5-b3fa6876ded7	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.903415+00	2025-08-17 13:44:22.903415+00	\N
0c000d2e-b513-4ec0-9f5a-e5ea0f28dda3	withowner@example.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	8e904d98-97f8-420e-a1fb-24ae5962a80d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
e3f80c68-bab2-490f-bfb0-8b8709829ad0	jameswilson@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	cbe1e31a-58ad-4ca5-9885-aaa5cc8caa7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.916082+00	2025-08-17 13:44:22.916082+00	\N
920b8c63-9c4f-4dc8-abb9-07bd450c76ca	james.wilson@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	cbe1e31a-58ad-4ca5-9885-aaa5cc8caa7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.917862+00	2025-08-17 13:44:22.917862+00	\N
cba2c90b-8bfb-48ea-8175-7066a68bd548	amanda.taylor@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	a8989009-ddeb-4db9-9ca3-5d5a73c3f157	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.926647+00	2025-08-17 13:44:22.926647+00	\N
8c4119c6-7351-42f6-8ddb-30d96a3f1aa3	amanda.taylor@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a8989009-ddeb-4db9-9ca3-5d5a73c3f157	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.928736+00	2025-08-17 13:44:22.928736+00	\N
3270faaa-a442-47fc-80df-8df286e784b6	christopher.brown@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	16646396-7e65-44e9-aa52-7c9d48c0bd5c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.933295+00	2025-08-17 13:44:22.933295+00	\N
333821c7-1644-453c-8083-7fff6e833362	christopher.brown@company.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	16646396-7e65-44e9-aa52-7c9d48c0bd5c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.935125+00	2025-08-17 13:44:22.935125+00	\N
e3912739-d903-4551-8400-eed884500f7b	maria.garcia@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	75841c1e-be55-4f91-8b2a-285ee3e2c95e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.945364+00	2025-08-17 13:44:22.945364+00	\N
a82c6ed9-8dec-4685-bcb8-7bbf861e3f8e	maria.garcia@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	75841c1e-be55-4f91-8b2a-285ee3e2c95e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.947547+00	2025-08-17 13:44:22.947547+00	\N
9d5d410f-2bde-4d56-9dd2-45d8779898b4	kevinlee260@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	87bebaf8-c2ec-4706-9a95-5ce3c56c210d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.956416+00	2025-08-17 13:44:22.956416+00	\N
7f67a751-d111-43dc-9c41-8cf8feb5b079	kevin.lee@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	87bebaf8-c2ec-4706-9a95-5ce3c56c210d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.95912+00	2025-08-17 13:44:22.95912+00	\N
b695e126-4d05-4896-9abe-ccf1ed2f8cca	rachel_davis@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	33200ec1-d51c-425f-b835-dd3a2f68d357	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.963416+00	2025-08-17 13:44:22.963416+00	\N
35c1672d-44fc-468a-a76e-0ba46ba12c21	rachel.davis@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	33200ec1-d51c-425f-b835-dd3a2f68d357	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.965387+00	2025-08-17 13:44:22.965387+00	\N
22cd9824-56eb-4378-a945-21701191a0b1	thomasmiller@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	f3d6d7a4-32d4-4345-868a-20ba08f9e8de	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.974021+00	2025-08-17 13:44:22.974021+00	\N
bd76fade-712d-46a7-a2c1-ac772cdcc559	thomas.miller@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	f3d6d7a4-32d4-4345-868a-20ba08f9e8de	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.976595+00	2025-08-17 13:44:22.976595+00	\N
55db7b4a-c5ec-4e63-965e-46ee70714b0a	nicole_white@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	a52e1a72-fb18-4760-993f-da512aa8ec9a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.983365+00	2025-08-17 13:44:22.983365+00	\N
69e1a5be-c135-41cf-b7a3-0687915275eb	nicole.white@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a52e1a72-fb18-4760-993f-da512aa8ec9a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.985231+00	2025-08-17 13:44:22.985231+00	\N
f146a3cd-203f-4bdd-9cb3-364df3ad9d0e	danielclark@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	a3e05fc1-2374-4f1f-9a62-838b78d9333f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.993443+00	2025-08-17 13:44:22.993443+00	\N
e647a80c-7c3f-47be-a60f-5a24df4d8191	daniel.clark@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a3e05fc1-2374-4f1f-9a62-838b78d9333f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.995859+00	2025-08-17 13:44:22.995859+00	\N
0c69a5f4-0e34-43d4-a7d1-f655e5a3b910	stephanielewis@hotmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	4ed58860-7eef-4aba-b152-ee469234363b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.002316+00	2025-08-17 13:44:23.002316+00	\N
cbd7c014-736a-4dbb-815e-634158ad26f2	stephanie.lewis@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	4ed58860-7eef-4aba-b152-ee469234363b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.004884+00	2025-08-17 13:44:23.004884+00	\N
523fff11-f0d9-4639-ac10-13f1efc43f3f	andrew_hall@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	53b9eb8c-555d-45f5-ad60-b135a14dc3fa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.012001+00	2025-08-17 13:44:23.012001+00	\N
4679d645-1db5-4fb9-ba48-45b8d35f8d05	jessicaallen@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	e918cd8e-64b0-45c9-8310-bf3c4c01598a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.016221+00	2025-08-17 13:44:23.016221+00	\N
f6490606-f3c1-4cac-aa18-5ad4d1c82583	jessica.allen@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	e918cd8e-64b0-45c9-8310-bf3c4c01598a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.017888+00	2025-08-17 13:44:23.017888+00	\N
c591bb20-f649-4a31-a0d6-138c9c9486a1	ryanyoung664@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	ace9c7b8-86e9-4b48-a126-75f22e14fdff	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.025381+00	2025-08-17 13:44:23.025381+00	\N
b20a0c66-486a-4639-88d5-c14d4831f2cc	ryan.young@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	ace9c7b8-86e9-4b48-a126-75f22e14fdff	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.027363+00	2025-08-17 13:44:23.027363+00	\N
644bf384-5557-4a6d-beec-21b71bdd04f2	sarah.johnson@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	cd55c2c8-ecd2-487e-a1c4-52c280c2bf4c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.067591+00	2025-08-18 02:55:15.067591+00	\N
b9336504-32af-44be-b846-6e9db1213ca8	sarah.johnson@corp.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	cd55c2c8-ecd2-487e-a1c4-52c280c2bf4c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.070379+00	2025-08-18 02:55:15.070379+00	\N
7e9e62f8-a33a-4dd7-a6ba-bc1ac9eee731	michaelchen386@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	2771d43c-c1f9-4bda-9885-f81fea26023c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.084369+00	2025-08-18 02:55:15.084369+00	\N
42f6f3c1-0ab6-4056-93bf-c216a2c2af69	michael.chen@enterprise.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	2771d43c-c1f9-4bda-9885-f81fea26023c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.086358+00	2025-08-18 02:55:15.086358+00	\N
f1b3bbeb-427a-4671-8786-983e9e9b960b	emily.rodriguez@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	267eb4cd-fd86-40db-9a1a-17692fd0e23c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.101113+00	2025-08-18 02:55:15.101113+00	\N
54b94a2a-8c30-4bb0-bab3-6ee9a6796106	emily.rodriguez@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	267eb4cd-fd86-40db-9a1a-17692fd0e23c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.104669+00	2025-08-18 02:55:15.104669+00	\N
1a816403-b519-4a22-8423-a65680a5757c	davidthompson701@yahoo.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	d461e239-611f-4a1c-a768-81bb4c34a0df	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.12126+00	2025-08-18 02:55:15.12126+00	\N
a118ef4d-d334-4d3a-aac0-376f9ddab5df	lisawang@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	afc348bd-91d6-4d70-b977-a539027e318a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.130956+00	2025-08-18 02:55:15.130956+00	\N
7f40eafe-bd6c-4b5a-8bc1-52210ba886cc	lisa.wang@enterprise.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	afc348bd-91d6-4d70-b977-a539027e318a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.132688+00	2025-08-18 02:55:15.132688+00	\N
53f83923-528b-45da-8a40-d97739aa4ed3	robert_anderson@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	9b539c21-7c5d-4a8f-a0ec-87fb99dcda53	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.143609+00	2025-08-18 02:55:15.143609+00	\N
9e9e3009-3428-40af-8892-b2f1d3d10ac2	robert.anderson@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	9b539c21-7c5d-4a8f-a0ec-87fb99dcda53	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.145342+00	2025-08-18 02:55:15.145342+00	\N
6df3ebc1-9dd4-482a-a5d5-bc3aa68cfd95	jennifermartinez@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	85431359-6040-491f-89a6-d18c651dda35	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.156037+00	2025-08-18 02:55:15.156037+00	\N
22cb3f5d-082f-4ffc-88d8-b60093f2c557	christopherwilson@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	ce38cfeb-efc5-4be9-943d-8a7d13054252	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.16527+00	2025-08-18 02:55:15.16527+00	\N
69a01654-a22b-4f31-9d7a-f3a5f3673fae	christopher.wilson@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	ce38cfeb-efc5-4be9-943d-8a7d13054252	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.166954+00	2025-08-18 02:55:15.166954+00	\N
b978a47e-9e3f-43c4-a242-7fc29c774fac	amandataylor@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	41a1889f-0ce5-44b6-90ae-74f94ae8395f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.178454+00	2025-08-18 02:55:15.178454+00	\N
e7a918f8-b7e6-4532-b3dc-82c7a1c6fec3	amanda.taylor@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	41a1889f-0ce5-44b6-90ae-74f94ae8395f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.180761+00	2025-08-18 02:55:15.180761+00	\N
3152f37d-1b5b-4d7c-9d45-17d35f284409	jamesbrown@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	29f657bd-ad62-4ff8-9079-e752adb8fc95	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.195886+00	2025-08-18 02:55:15.195886+00	\N
e714d831-889a-4855-9c17-f502068a1b9d	james.brown@corp.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	29f657bd-ad62-4ff8-9079-e752adb8fc95	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.197491+00	2025-08-18 02:55:15.197491+00	\N
6b34dfb3-5cb8-426b-ae9d-2a6614751aa1	mariagarcia@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	9e870dbe-365e-47a7-a95c-0f67dd9cebde	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.208087+00	2025-08-18 02:55:15.208087+00	\N
eb0a29de-7dec-4fbc-af56-7c5e4d626887	maria.garcia@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	9e870dbe-365e-47a7-a95c-0f67dd9cebde	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.209736+00	2025-08-18 02:55:15.209736+00	\N
512a9761-6e70-4374-92a6-7c6fd39703eb	kevinlee419@icloud.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	7815fdbc-9c74-42e0-bbce-f38f376245b8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.218795+00	2025-08-18 02:55:15.218795+00	\N
6ccb0447-7f20-4924-a07a-d9a63c52acdd	kevin.lee@enterprise.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	7815fdbc-9c74-42e0-bbce-f38f376245b8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.220597+00	2025-08-18 02:55:15.220597+00	\N
3eb82cd2-3bd0-47db-8687-fa975f93a4e8	racheldavis257@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	b6a49221-833f-4f0e-9a50-c851993efc85	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.231358+00	2025-08-18 02:55:15.231358+00	\N
4d219e10-b9f1-4f9d-bdbd-b45a734a2376	rachel.davis@corp.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b6a49221-833f-4f0e-9a50-c851993efc85	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.232964+00	2025-08-18 02:55:15.232964+00	\N
9da4606d-6b90-4cce-9020-226323ba070b	thomasmiller505@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	908904fb-611c-4d96-ac00-112efaad8b5a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.245488+00	2025-08-18 02:55:15.245488+00	\N
a6305c72-79bc-4414-a4d0-e7824a758cc1	nicole.white@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	91fc63e7-940c-4fb1-9c07-c465ac942d49	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.258152+00	2025-08-18 02:55:15.258152+00	\N
7b926f34-ce97-4575-8db3-eb3c519a9ef2	danielclark@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	8dd1c642-ce9c-4c71-9edb-71cbc4f4fbd4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.266937+00	2025-08-18 02:55:15.266937+00	\N
b17c512c-9db6-43ce-9535-fb6eb91e4029	daniel.clark@enterprise.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	8dd1c642-ce9c-4c71-9edb-71cbc4f4fbd4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.26855+00	2025-08-18 02:55:15.26855+00	\N
d02537e9-e40a-4ce4-8be3-3b823bb81f67	stephanielewis906@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	23391801-1492-42b3-8dbd-547d8543849e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.279254+00	2025-08-18 02:55:15.279254+00	\N
03ed4ecc-1e3d-4f07-9838-1ba95cb0b900	stephanie.lewis@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	23391801-1492-42b3-8dbd-547d8543849e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.280874+00	2025-08-18 02:55:15.280874+00	\N
82b76125-4108-4a76-b66e-4aa127e74c9b	andrewhall346@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	31ecbbc0-e8e3-40d4-a154-82a3e5d00c26	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.295649+00	2025-08-18 02:55:15.295649+00	\N
b74cafae-8024-43f9-8851-6ee1e40906d5	jessicaallen@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	646d6f02-718a-4c53-bbbd-d58eea128eae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.309375+00	2025-08-18 02:55:15.309375+00	\N
2b332432-43e7-4fa4-b3ca-cda5922c3212	jessica.allen@enterprise.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	646d6f02-718a-4c53-bbbd-d58eea128eae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.311092+00	2025-08-18 02:55:15.311092+00	\N
7fd781dd-cd51-426c-a9dd-dbfdb9f1b61d	ryan.young@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	121e9087-021e-40b7-940d-67ad17509dfc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.325273+00	2025-08-18 02:55:15.325273+00	\N
3827b119-1262-40c6-b59e-657a93542877	ryan.young@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	121e9087-021e-40b7-940d-67ad17509dfc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.32694+00	2025-08-18 02:55:15.32694+00	\N
f701b3a3-1673-4120-947b-1d5b06148bf9	ashley_king@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	236a6915-c1e6-4383-84a4-e1beeae48946	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.339257+00	2025-08-18 02:55:15.339257+00	\N
ec6bdc87-13be-4b59-b90c-5e2c05f072c8	ashley.king@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	236a6915-c1e6-4383-84a4-e1beeae48946	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.340889+00	2025-08-18 02:55:15.340889+00	\N
039f381a-d34f-4a01-80bc-270438a11a04	matthewwright@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	37df802c-9567-49cd-ac53-32844bfac8e9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.351326+00	2025-08-18 02:55:15.351326+00	\N
4a71cf55-cd3b-458f-8671-4b02eb74ac30	emilyrodriguez726@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	ee54ca3b-fe64-472e-807c-f04975020c02	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.195428+00	2025-08-17 13:44:23.195428+00	\N
5a3f23a9-c7cb-44c6-95a9-4e25b3e49589	emily.rodriguez@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	ee54ca3b-fe64-472e-807c-f04975020c02	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.197119+00	2025-08-17 13:44:23.197119+00	\N
b0263376-a507-45fe-8e26-deeb41eeee07	lauren.lopez@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	287bc30a-d62a-4e07-a6f8-c5046d07f99e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.374544+00	2025-08-18 02:55:15.374544+00	\N
d227a382-12a2-4abd-9619-10817caa78ff	joshuahill342@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	54c1338c-8fa7-4983-9757-423a70ef6cf5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.406442+00	2025-08-18 02:55:15.406442+00	\N
b27504a6-da44-4736-a9c4-fbe7998107dd	joshua.hill@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	54c1338c-8fa7-4983-9757-423a70ef6cf5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.411456+00	2025-08-18 02:55:15.411456+00	\N
ab53b003-075e-4eea-b061-218ace5c424e	meganscott@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	b24ead22-d7df-4e0f-a8f5-79dd1d93f71f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.449042+00	2025-08-18 02:55:15.449042+00	\N
e370b267-1510-42b4-9e07-05db5d55ab5a	megan.scott@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b24ead22-d7df-4e0f-a8f5-79dd1d93f71f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.45486+00	2025-08-18 02:55:15.45486+00	\N
0ce80b38-0c8f-43e5-a54f-795f050913ea	justin_green@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	52960a86-cfc0-476b-b93a-eac715fd2227	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.474644+00	2025-08-18 02:55:15.474644+00	\N
016285b5-6e19-4bda-be9d-694c69a7a5f8	christopherwilson660@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	2e9b5160-e260-4461-86ca-0febd7a1f096	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.233458+00	2025-08-17 13:44:23.233458+00	\N
572bda52-ac89-4411-9bd9-e318ab68e10b	christopher.wilson@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	2e9b5160-e260-4461-86ca-0febd7a1f096	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.235298+00	2025-08-17 13:44:23.235298+00	\N
2db93373-f837-45b1-b004-9b8be03960e0	hannah_adams@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	a40ac272-8ac6-455e-8d84-bd776c8a067e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.495368+00	2025-08-18 02:55:15.495368+00	\N
4f6e8266-9544-4042-905d-173833f969b3	jamesbrown@hotmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	c685caad-fbcd-419d-986d-0511ef70225a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.248454+00	2025-08-17 13:44:23.248454+00	\N
8aa1ad48-4d18-4393-ac98-2f0106532a87	james.brown@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	c685caad-fbcd-419d-986d-0511ef70225a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.250905+00	2025-08-17 13:44:23.250905+00	\N
554e5da6-7a1f-4742-9b97-bf13c23a3efd	brandon.baker@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	b27f9347-98a5-4539-a8a3-cec91d478d58	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.512263+00	2025-08-18 02:55:15.512263+00	\N
4ded8f8f-c4ed-4546-9b22-f36410e453e9	brandon.baker@enterprise.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b27f9347-98a5-4539-a8a3-cec91d478d58	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.514247+00	2025-08-18 02:55:15.514247+00	\N
1b884c5a-4451-4d16-ba04-5c14f5603e25	kaylagonzalez459@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	2ee58325-4cf0-4ccb-99a2-4d2259a7c52a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.531459+00	2025-08-18 02:55:15.531459+00	\N
e4fb3a43-019c-4bdd-a2fd-3a79ab72e4ec	tylernelson@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	0eb4c92d-9868-4774-9318-f87dce8e1ce1	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.54454+00	2025-08-18 02:55:15.54454+00	\N
4fa98d72-8f22-4850-a0de-1dced50a99ee	tyler.nelson@corp.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	0eb4c92d-9868-4774-9318-f87dce8e1ce1	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.54772+00	2025-08-18 02:55:15.54772+00	\N
06e2022b-77cc-4b88-a669-a7559d33ed63	alexandra.carter@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	a65d6716-0816-480b-a6a6-77b4b62f9330	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.566434+00	2025-08-18 02:55:15.566434+00	\N
22fbaa67-a50f-4ca9-8bf0-93e533a0e470	alexandra.carter@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a65d6716-0816-480b-a6a6-77b4b62f9330	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.568566+00	2025-08-18 02:55:15.568566+00	\N
4857907d-7f09-4804-bd4f-b6b36b17387d	zacharymitchell@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	367e6934-6b67-497f-888a-53155fa4fbc8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.590428+00	2025-08-18 02:55:15.590428+00	\N
9b7909ea-c864-4d70-9a8b-8528e6251e71	victoriaperez398@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	2c88a6c9-6f3b-4fd8-86fa-fd0581c2dcb2	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.609578+00	2025-08-18 02:55:15.609578+00	\N
a8a4dde7-3f50-4000-8994-14a1ec259ec3	victoria.perez@corp.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	2c88a6c9-6f3b-4fd8-86fa-fd0581c2dcb2	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.611541+00	2025-08-18 02:55:15.611541+00	\N
4587786b-0433-4b74-93cb-69a26763226a	nathanroberts442@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	ceb3f035-6384-4650-b385-02b8c704f477	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.628042+00	2025-08-18 02:55:15.628042+00	\N
fb76da80-f1b6-43af-8fe9-7bf5804deab7	nathan.roberts@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	ceb3f035-6384-4650-b385-02b8c704f477	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.631634+00	2025-08-18 02:55:15.631634+00	\N
6ee0006a-5251-4990-80f0-0555d63c80b0	samanthaturner173@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	0a518a68-b89c-4e08-aee0-c05334e7dc57	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.645368+00	2025-08-18 02:55:15.645368+00	\N
b4fab222-fa2e-415b-a88f-f61a00afa1ff	ericphillips@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	b19ac50e-e030-41bb-9671-53b1dd331a30	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.657895+00	2025-08-18 02:55:15.657895+00	\N
1dcf0083-6ef9-4c4a-a541-a7d6213e6bd1	rebeccacampbell978@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	01b05834-bb0d-43c8-b4da-ed27dbd912a9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.67921+00	2025-08-18 02:55:15.67921+00	\N
f38ec263-4a38-4f5d-92ed-56aff8c52ec6	adamparker234@hotmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	e1e0af9b-b354-492c-ad7a-1eac6822b94f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.688271+00	2025-08-18 02:55:15.688271+00	\N
7273a61a-c3eb-46ea-aaa5-8ea26de9f640	michelle.evans@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	120b214a-074b-4a9a-9fc5-ca36d2a2f9b3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.701139+00	2025-08-18 02:55:15.701139+00	\N
79cd7843-0549-4679-8faf-f5d45f2458bd	ashley_king@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	673e3787-b9d3-4f29-8c99-47bd4288c0ae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.331064+00	2025-08-17 13:44:23.331064+00	\N
cbdc6d08-5f73-4e2c-b85d-85fc2e2a3349	matthew_wright@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	f73af282-1e7c-4aff-a1f8-00cb2ac85f75	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.338194+00	2025-08-17 13:44:23.338194+00	\N
c8de5af9-c8a0-4357-b4aa-4eaae2370ea3	lauren.lopez@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	89c62806-64bb-4f75-9a89-db2e53ba0e3d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.345654+00	2025-08-17 13:44:23.345654+00	\N
09c2aee8-6258-43df-9b0f-4f16a9fc457d	joshuahill@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	64a602ac-e866-4ed9-a2dc-ceca1c817857	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.351378+00	2025-08-17 13:44:23.351378+00	\N
17e3b834-e449-4a89-a566-f313e112d3a1	joshua.hill@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	64a602ac-e866-4ed9-a2dc-ceca1c817857	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.35336+00	2025-08-17 13:44:23.35336+00	\N
d27f7062-a6b4-4456-bedf-03cf503e5d16	meganscott@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	a44420fd-7110-4dad-9da9-ca2b193f3b2d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.358702+00	2025-08-17 13:44:23.358702+00	\N
c8123a3e-f565-4e0c-aa40-4507e13ecc49	megan.scott@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a44420fd-7110-4dad-9da9-ca2b193f3b2d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.360573+00	2025-08-17 13:44:23.360573+00	\N
6b32bd39-6a37-4554-bc3f-9093f9e130e7	justingreen@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	bb9580c7-23e9-46fb-855f-a941a7bfee44	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.364659+00	2025-08-17 13:44:23.364659+00	\N
66c648ad-b105-4e6e-af0e-0f32fc1e9610	hannahadams124@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	c218f25f-f12c-4bd6-ba47-5ceac93febcf	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.370783+00	2025-08-17 13:44:23.370783+00	\N
6f52d871-bf72-49e9-802b-b297d6fce4a2	brandon_baker@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	9eabb160-fca8-406b-89ac-0b3176ae679c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.376244+00	2025-08-17 13:44:23.376244+00	\N
16a9dbec-2b0d-4370-b5cd-c78a7331f165	brandon.baker@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	9eabb160-fca8-406b-89ac-0b3176ae679c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.378284+00	2025-08-17 13:44:23.378284+00	\N
b2363244-7eb2-4b3a-bf80-01f17cf0dafe	kayla_gonzalez@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	8330bd5c-2c78-499a-8271-070ce50b33ca	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.384225+00	2025-08-17 13:44:23.384225+00	\N
05caee4a-2c2e-4b24-b571-5b7164753d69	kayla.gonzalez@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	8330bd5c-2c78-499a-8271-070ce50b33ca	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.386063+00	2025-08-17 13:44:23.386063+00	\N
5e44107d-0003-4fa9-805f-dbdf9211adaf	tyler_nelson@yahoo.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	1d09275b-feab-48d0-b599-68db8a516674	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.394285+00	2025-08-17 13:44:23.394285+00	\N
6cbc663f-c243-4241-b244-384550197eba	tyler.nelson@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	1d09275b-feab-48d0-b599-68db8a516674	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.396743+00	2025-08-17 13:44:23.396743+00	\N
1ddb4921-bce9-4f8f-afbf-ef0a99da2f70	alexandracarter@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	e403d4a2-31b4-4d06-819a-08f3f0967020	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.401204+00	2025-08-17 13:44:23.401204+00	\N
d49d7ba0-791c-402f-a65d-b080857639ab	zacharymitchell726@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	27f6e5ec-817d-4ad2-afba-d3e1b10e5b3f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.406112+00	2025-08-17 13:44:23.406112+00	\N
bf254ded-7df2-4f79-b0ec-866a39f86c2b	victoria.perez@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	0919ca3b-5414-4387-80b4-b53d278ab1e9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.413392+00	2025-08-17 13:44:23.413392+00	\N
173b2f9f-6cf5-4828-98b5-c62c70982447	victoria.perez@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	0919ca3b-5414-4387-80b4-b53d278ab1e9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.415131+00	2025-08-17 13:44:23.415131+00	\N
c2d34420-5298-4bb7-b89d-b91d120aa680	nathanroberts@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	2ccfbd5b-2ff9-4172-8a30-a3fff5710238	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.421689+00	2025-08-17 13:44:23.421689+00	\N
af5be22b-a9fe-4245-a83d-be0992380715	samanthaturner475@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	47efeca3-a40e-4f19-baee-83b8c2ce8efc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.428786+00	2025-08-17 13:44:23.428786+00	\N
eee0720f-0df2-4665-841e-976e9156286e	ericphillips86@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	f0dff0ba-f719-4f96-8616-af6590d75401	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.432812+00	2025-08-17 13:44:23.432812+00	\N
f4778807-99bc-49c5-ac46-e3e887590d45	rebeccacampbell556@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	b754692c-7ebe-4721-8c4d-d79d0c9c4410	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.43823+00	2025-08-17 13:44:23.43823+00	\N
3da28205-ee2a-4849-be3b-26f92f8675b8	rebecca.campbell@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b754692c-7ebe-4721-8c4d-d79d0c9c4410	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.440655+00	2025-08-17 13:44:23.440655+00	\N
325facb5-6a83-41c3-bd94-76fd44cf8a30	adam_parker@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	c2a5e03b-3c79-4a89-b735-f4e5b37ca0da	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.445263+00	2025-08-17 13:44:23.445263+00	\N
7a630fd8-08b7-498c-8c2d-4b6422cf22a2	adam.parker@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	c2a5e03b-3c79-4a89-b735-f4e5b37ca0da	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.447089+00	2025-08-17 13:44:23.447089+00	\N
45017eb4-c0ae-47bb-907c-050abc45f089	michelle.evans@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	345de5af-b5ec-4596-ac21-f0b7ea4e25ad	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.454712+00	2025-08-17 13:44:23.454712+00	\N
99cdd557-9895-4169-a874-4d3b1b1d27bf	michelle.evans@company.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	345de5af-b5ec-4596-ac21-f0b7ea4e25ad	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.457196+00	2025-08-17 13:44:23.457196+00	\N
965d8149-25a7-472d-bf62-53871b043856	steven.edwards@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	2604602e-b45e-46ce-beb2-889a80004c15	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.461699+00	2025-08-17 13:44:23.461699+00	\N
5abd8b5c-8dbd-469e-8aa7-3ca01c8189fc	steven.edwards@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	2604602e-b45e-46ce-beb2-889a80004c15	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.46341+00	2025-08-17 13:44:23.46341+00	\N
d46edcbc-1dd7-4515-9555-ebea818184f4	amber.collins@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	46329ca7-07e6-4e20-ae38-de578a8a17ec	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.468423+00	2025-08-17 13:44:23.468423+00	\N
be6c48b5-1f82-4c38-b52a-e8a0063faf31	amber.collins@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	46329ca7-07e6-4e20-ae38-de578a8a17ec	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.471498+00	2025-08-17 13:44:23.471498+00	\N
a814d64a-542e-4dfe-986f-0b612c63a1ad	timothy.stewart@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	81d7b663-6309-4c6a-9b15-df2116603e7c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.478583+00	2025-08-17 13:44:23.478583+00	\N
e815df63-7f40-41ac-a946-a756298fba4b	danielle.sanchez@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	2f1441fd-04b9-4d61-bcb0-b9e70e01d17a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.484567+00	2025-08-17 13:44:23.484567+00	\N
2aeb7531-bd43-4310-8e8a-53c849a5dfb5	kyle.morris@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	2d009c16-2efc-4aff-969b-3ffdcd889455	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.492989+00	2025-08-17 13:44:23.492989+00	\N
e9fbbbd2-3238-4311-a0b9-26eafc79e052	brittanyrogers@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	b16af43d-4eca-42ae-88d0-b226bc972b45	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.497077+00	2025-08-17 13:44:23.497077+00	\N
0e26bb7b-77e5-430c-a3a2-55bba4fcad86	brittany.rogers@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b16af43d-4eca-42ae-88d0-b226bc972b45	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.498779+00	2025-08-17 13:44:23.498779+00	\N
05835794-153f-46c9-9ee9-81bd1d3797a8	jeffreyreed@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	bf1250e4-f880-49cf-8922-c58160f1c54a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.503483+00	2025-08-17 13:44:23.503483+00	\N
06205aa2-daa4-467b-8cc7-0ac670b7a0b9	jeffrey.reed@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	bf1250e4-f880-49cf-8922-c58160f1c54a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.506466+00	2025-08-17 13:44:23.506466+00	\N
baa8beb7-60d0-488e-8ae9-b7127e9071a3	courtneycook175@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	3d217f34-7bf3-495e-a7cf-c5b86460e720	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.512883+00	2025-08-17 13:44:23.512883+00	\N
d881baba-0329-4417-84f8-f7515fcfd9e7	courtney.cook@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	3d217f34-7bf3-495e-a7cf-c5b86460e720	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.514764+00	2025-08-17 13:44:23.514764+00	\N
bdd1cee2-d87d-41b3-ab8f-2691b465b5ef	mark.morgan@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	487a22b0-19c8-4cce-82bf-b3aba6d573b4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.521482+00	2025-08-17 13:44:23.521482+00	\N
37a360cc-46ce-4fe0-a0ab-2f5fc97a1f63	mark.morgan@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	487a22b0-19c8-4cce-82bf-b3aba6d573b4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.524309+00	2025-08-17 13:44:23.524309+00	\N
762e274d-0ddc-4a9c-b46f-b86f1706d530	tiffany.bell@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	3c776a84-690f-49b4-9b92-a7b0b05bf02c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.528857+00	2025-08-17 13:44:23.528857+00	\N
dff34765-ca4c-4d75-9a28-a7eac371c0c4	tiffany.bell@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	3c776a84-690f-49b4-9b92-a7b0b05bf02c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.530707+00	2025-08-17 13:44:23.530707+00	\N
835ee2ac-6168-4895-b433-7002551d3af8	brianmurphy582@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	048fb772-8d84-4a5a-a041-b53e813ad11d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.53895+00	2025-08-17 13:44:23.53895+00	\N
86f43ddf-6c69-427c-9432-984399d4687b	brian.murphy@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	048fb772-8d84-4a5a-a041-b53e813ad11d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.541811+00	2025-08-17 13:44:23.541811+00	\N
2e6b9499-7aa9-4ad0-91eb-c8ac64ebabf5	john.doe@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	817f740e-6756-43f8-b62c-546be5e1264f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.546648+00	2025-08-17 13:44:23.546648+00	\N
7fba6a14-ff94-4162-9316-78de157f36fd	janesmith670@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	1651b848-eaf2-45e4-9c8a-b86f5d9cf9b9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.551043+00	2025-08-17 13:44:23.551043+00	\N
dc6b171a-43f6-4854-bb40-26ab84d6df5f	steven_edwards@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	f62f2ffe-bc11-4ad4-aa1e-394c378a0961	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.71293+00	2025-08-18 02:55:15.71293+00	\N
33c98936-c618-40fd-a027-386c6b6126a2	fullcontact611@hotmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	b71ee491-3ce5-454b-ac30-52a257a6545a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.566731+00	2025-08-17 13:44:23.566731+00	\N
8541129e-5c16-4b5c-97f9-dfa11e5a9c9d	full.contact@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b71ee491-3ce5-454b-ac30-52a257a6545a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.568696+00	2025-08-17 13:44:23.568696+00	\N
c8578a8a-31f2-4a27-b137-b2655150327f	amber_collins@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	376ca675-1847-46a9-bca9-e44389fa2b37	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.724321+00	2025-08-18 02:55:15.724321+00	\N
c9823bd3-201d-4a39-8497-1926d4b29824	amber.collins@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	376ca675-1847-46a9-bca9-e44389fa2b37	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.72612+00	2025-08-18 02:55:15.72612+00	\N
28fd50be-6000-4b34-be84-65d1b191ee5d	fullcontact@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	3ae8ea21-9bbb-4793-a817-4400d1e0bbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.588674+00	2025-08-17 13:44:23.588674+00	\N
161ae503-d61f-4dd7-a332-4132d132d67c	timothystewart@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	f6fba39d-6836-4bae-9510-36e23bb12d7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.737523+00	2025-08-18 02:55:15.737523+00	\N
8bdd18ff-9ed5-476a-b631-ffb231641d99	danielle_sanchez@icloud.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	97b27d1b-a376-4804-a447-ecd4dd1cda7f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.748861+00	2025-08-18 02:55:15.748861+00	\N
3503a2da-67cb-444a-a211-54b8b6473066	danielle.sanchez@enterprise.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	97b27d1b-a376-4804-a447-ecd4dd1cda7f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.750752+00	2025-08-18 02:55:15.750752+00	\N
4acdeb7e-8175-4ea8-a27d-5333bf552137	kyle.morris@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	bd856c40-6e97-4f86-a3b9-7aba2618a39c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.760425+00	2025-08-18 02:55:15.760425+00	\N
abc1de22-45e6-4b9c-ba31-578b76621a81	brittany.rogers@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	2a4ec289-cd62-496d-9635-e0b2959234c9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.774772+00	2025-08-18 02:55:15.774772+00	\N
7b103389-9212-47fb-b90d-c1295c81f104	brianle@hotmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	e4206740-6e12-438a-88c0-20d34a77d92a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.62164+00	2025-08-17 13:44:23.62164+00	\N
4e5950bb-f302-45e2-8f45-804b726f829e	jeffrey_reed@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	a3359bff-5b5f-4e0a-a8fc-d5b45b3a0024	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.783311+00	2025-08-18 02:55:15.783311+00	\N
a550ea34-6753-496f-973e-31eeceb196df	jeffrey.reed@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a3359bff-5b5f-4e0a-a8fc-d5b45b3a0024	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.785011+00	2025-08-18 02:55:15.785011+00	\N
f0bc5e44-6373-4365-b2ad-e62217835df4	courtney_cook@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	0c444676-f5e5-4275-b438-caff065b3d22	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.793442+00	2025-08-18 02:55:15.793442+00	\N
766e8062-a32f-461c-8b82-85ecf19db5aa	testcontact@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	9701b59a-e8b6-4eec-b8d6-e717727e350f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.647812+00	2025-08-17 13:44:23.647812+00	\N
060825cc-b0c6-47bc-8fc9-07e47f856bda	test.contact@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	9701b59a-e8b6-4eec-b8d6-e717727e350f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.649655+00	2025-08-17 13:44:23.649655+00	\N
61e033a2-217f-4772-b4ea-28491943f39d	test_contact@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	546079f5-23d1-4df5-bfa5-2f99cd73a3bc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.654646+00	2025-08-17 13:44:23.654646+00	\N
9409f5c8-f54d-44a3-aa43-150c0d1762c7	courtney.cook@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	0c444676-f5e5-4275-b438-caff065b3d22	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.795878+00	2025-08-18 02:55:15.795878+00	\N
83f2cb6b-e07d-40df-947d-4ab1875bd6bf	markmorgan@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	4f586d8f-4b05-4bb9-8b3a-70ccaccfefd6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.812782+00	2025-08-18 02:55:15.812782+00	\N
f55586bb-1e5d-4a80-80c5-00cc9059b8d8	tiffany_bell@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	b2eba624-0dd1-4178-964d-837b6959c1a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.825505+00	2025-08-18 02:55:15.825505+00	\N
5dac1522-eeb5-4589-a6c7-c688d7bf420a	tiffany.bell@enterprise.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	b2eba624-0dd1-4178-964d-837b6959c1a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.82717+00	2025-08-18 02:55:15.82717+00	\N
bfa800fc-c444-4aed-b6be-302438c64477	brianmurphy454@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	cd4a1698-ccc4-4e51-b67d-0359d996f47e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.841927+00	2025-08-18 02:55:15.841927+00	\N
946629b3-893e-4e80-b1b4-1559ba8a160e	brian_le@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	108648cc-0f9b-460f-b395-45866ff4d812	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.687504+00	2025-08-17 13:44:23.687504+00	\N
8627ca43-458b-4ddd-897c-d6521ab344b3	brian.le@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	108648cc-0f9b-460f-b395-45866ff4d812	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.690229+00	2025-08-17 13:44:23.690229+00	\N
2c9f1d32-9c97-4227-a1ad-5bcb3aca2734	brian.murphy@corp.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	cd4a1698-ccc4-4e51-b67d-0359d996f47e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.843652+00	2025-08-18 02:55:15.843652+00	\N
5afc8f32-9f52-401c-928c-2e458278b0a3	bele@hotmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	e85bbb6e-f89c-4248-a41f-25fe355019de	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.701306+00	2025-08-17 13:44:23.701306+00	\N
c4f01af7-0658-4ab6-8e8a-a6768c5d7568	be.le@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	e85bbb6e-f89c-4248-a41f-25fe355019de	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.703278+00	2025-08-17 13:44:23.703278+00	\N
3a7942a1-7a9c-49b6-86b6-da22c7720ae0	anthony21512@smart.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	b5d95210-8c01-4eb2-bec2-ced705e9c90a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
105f49a6-d43a-417e-966f-20229186bb5d	helenlopez@smart.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	923d50f0-1533-41b8-af8d-c1a8eb65212b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
e252e8b6-0e49-4cae-abcf-5370513a1eed	anthonygreen@cloud.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	fd6b2fcf-5ae6-42a9-8d02-4a1cbf9b9e70	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
8c3ec005-1e9c-4389-abad-24b32d02e2b6	kevin.smith@enterprise.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	5591d830-f231-4277-a277-3d76bb56fda4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
543966cc-52d0-4076-8986-d7f267750dfb	maria.torres22476@mobile.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	af70e48c-e93a-4931-8158-46b6e2897ddc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
930f2dcb-46f2-4c87-826f-e9b9a5f0bb1a	donna.williams@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	9ddc27e3-c6b8-4a48-96dd-134a6750b48c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
64ef89fe-cb78-45e1-8e6a-3855eb1a5c93	susan2253@startup.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	68e3ca4e-3c35-4236-ab30-c36fd6c4df7e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
19a4fe7b-c23c-4528-8c4d-796513561187	betty.lewis@startup.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	ac627c24-26bd-4153-8de0-03b2ee5e74bc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
28d255fa-9018-49c8-a386-7f75fb6630ff	daniel23718@blockchain.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	06d0ccfe-781d-4187-9a23-19641e6f10e2	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
683e2f04-f273-40d7-a8b2-9592e308dfea	steven.torres14348@web.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	20d6a06f-e74b-420d-b563-8f76414a5eaf	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
2e56de0b-ba04-4f2e-87eb-b9441ea2afb3	paulnguyen@business.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	b682efe6-31da-4566-8de1-f50acba3ebf3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
98606f4f-8a78-462d-a36d-008d86143888	robert_mitchell@digital.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	99102125-6daa-43ba-9cff-9b0491cc0b38	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
073542eb-dd07-4041-b4f9-2f94e2dea0fe	james.johnson16864@nextgen.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	2d4cc63f-2396-48d9-81cd-01e7f59f6bec	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
ab57e5f4-db41-45d4-9180-f641f91696e1	jamessanchez@mobile.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	0fb2521b-2d80-42da-bbfb-625601e9d72f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
59f742a7-da5c-43da-b169-ee133e3bbdbc	sarahjackson@software.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	b6a53116-3265-4a29-a01a-96bef1b8cf89	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
53fbbbcb-b24c-4ddd-8c75-c8e3d14c5b4e	john14972@nextgen.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	5e530eda-fdaa-4aa4-9871-97252dccc966	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
369f4015-69d4-45d7-9a81-41556feb0d77	kennethsmith@ecommerce.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	fd2a737d-bcde-46c8-8fc1-d8fa20bff3f0	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
f14464f9-4306-4cba-b896-9b0b913aadde	patricia_jackson@nextgen.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	e68d1e20-84fd-4564-a757-fe3f272e43fa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
2b6fe775-8f9d-4960-b64a-39de67a676d3	kevin32040@tech.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	8a7daa72-e559-4426-afd1-3eee65a6ec99	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
a7542026-91e1-4674-b0d4-fa0f964b023d	lisa_harris@digital.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	f6a1f81b-e0b6-4d7f-a39b-0b9d701b5006	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
4d3248c3-57f3-4b3b-af9d-4769897d4177	emily10713@ai.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	893ee0ec-c718-497d-89bd-a98a21a30163	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
02a12afa-830b-400a-8723-b9bb1a998e85	donna.anderson@tech.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	d320e4e0-9e0f-4eaf-b97e-4ab85851873e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
f510137e-5f18-4f22-8de1-1fb125e4e7c9	steven_nguyen@startup.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	b74b2fe6-38d2-4154-b6ca-007acd6bdb58	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
60d0a951-9892-45cb-a31f-9791ccc5ea7c	jessica.martin@digital.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	cbb6f458-1c3d-4a48-afc5-799bbcca4671	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
46ed2e05-b3ab-486e-a4a7-be6752e4f12a	timothy.walker15448@blockchain.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	9486dee5-bc02-4d1d-b12b-f3e48d5eb10a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
1c805986-4a1a-4f86-ab45-dbc8dc01ed53	anthony_gonzalez@enterprise.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	a1741766-bcc5-45aa-8381-f9492d35f90d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
847cfc3b-7f5b-478a-b323-e64dbce60002	donald_mitchell@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	4f42bc46-27e6-43c7-8926-b06468656b34	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
bccb0961-8a83-4582-a609-fce833f1a63b	susan_garcia@marketing.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	e20382b4-fca4-4077-8b46-371051520383	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
486eb959-a8bc-420e-be47-8adee210e7f9	carolgarcia@outlook.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	367924b0-7eec-4b7c-8f17-13d0917dde8e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
c9ea7f37-12d3-4593-b62b-a52212bb309c	edward28606@web.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	a48a2ac3-5ae2-4705-9a1f-b0a7ff153333	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
7874e8bb-9188-4272-9a0d-d6882d19bc7f	christophergreen@web.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	7cd47f9d-7f2d-4765-86f2-b15b48ebb899	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
152003bc-15c6-457e-8591-4ab8ec5e1c26	stevenjones@data.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	70b3a0a7-cbb0-4f1f-a290-e88b67dc5c7f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
b3d92ac2-be62-4353-b1d3-844fbd3c8ead	emily_mitchell@smart.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	5b34b9e3-c6e1-4172-96de-077be7ef499f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
e436965b-d460-4db7-b2b5-27256a90fd8a	george_carter@software.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	55624910-09e2-4469-b63f-e1263eac2186	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
b83321bd-ebe2-4dfc-96b1-373f5ef4869d	thomas22432@smart.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	93ff41f7-db8a-41d6-b4cf-bac491a97e4c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
339b33a7-b338-409b-b6e2-409a22bbaa8f	ronaldmiller@startup.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	1df24149-8a82-4f17-b240-4d8021bd9a35	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
f3050ef6-e11f-49f8-845f-c4ddad12bbde	nancy.torres@consulting.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	8fd7a0ba-5385-4542-b9fb-783cec2ad609	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
fc326227-77f8-4566-bae8-d9687a37c540	thomas3790@software.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	d1f54120-9910-4443-9c07-3f9d25346855	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
aa79b4e9-2144-425d-80b5-bc489c5b2f0f	helen_wilson@enterprise.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	9bb2f1cd-9dbb-4ee8-9c30-bd18aa95d6a6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
633d10fc-cac7-48fd-a6fa-d8372ff80ec1	johnmartin@future.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	dc42dff5-df03-483f-b42f-620450d5c955	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
9a82a128-9e97-4469-8887-44badc776655	deborah.king1331@tech.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	521f72e2-c737-46aa-a0e1-4510aebff95b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
38b54cd5-c760-4efb-8556-cf4ad0d11afe	jessicamoore@data.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	0e85ece1-089a-4c4e-b98d-ca04a42c05b3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
5cf7b0cc-2c8e-48ec-8530-060b39a9024a	laura.rodriguez13413@vr.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	94b6ee70-b56b-48b7-bba6-af3d7bc4e6b9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
22c4b10c-6b9d-4365-996d-1d2641faa68a	donna4884@vr.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	bcb6a848-02e9-4338-a9c6-0f3f4cb92714	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
325c772b-c2c8-430a-8047-10ac6d0dee50	jamesperez@innovation.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	686e2af8-b08c-412c-b26f-83bdfb00c042	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
466fa91d-6910-4ef5-bc59-caa13be8969b	sharon.clark2021@tech.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	3db982a1-3b4a-4fe4-bf47-ac68037b5a49	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
661337f1-693e-4c95-8a86-0f32952bdba6	sarah27178@digital.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	e76c2a1a-4d6a-4011-bb66-28f982b368a3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
f2473309-97cd-46b7-872e-1fd261242a0d	kevin_king@enterprise.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	34ad8b95-788e-49da-9e60-a5105158484a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
60ba71f2-0830-46f3-92b1-abdc3f68c0e4	steven.ramirez@enterprise.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	1d1f1be9-828c-474b-84b7-c7603dc19273	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
9714dc52-67bb-4153-afe5-1adc570d8fa0	williamgonzalez@tech.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	a9a5d69b-ac39-4d6b-8c6c-a94949a9c3b6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	\N
86e38415-d7fe-43f7-b130-dcf246832954	emily_rodriguez@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	b9f04d97-3de9-4904-abfc-02da289b36c3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.581442+00	2025-08-17 16:27:08.581442+00	\N
05bfdc26-04ae-477a-888d-bead65b8bb9d	christopherwilson@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	f3b9674b-6d74-44fc-8e45-d211e690bbbe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.661092+00	2025-08-17 16:27:08.661092+00	\N
ffb1a070-f799-4c8b-8429-019ad9f4c912	christopher.wilson@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	f3b9674b-6d74-44fc-8e45-d211e690bbbe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.663096+00	2025-08-17 16:27:08.663096+00	\N
e997b727-edbf-4d18-9c65-64372c3958a5	james_brown@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	cb7bd4d2-dd4f-4f3e-ac59-0a62a347c699	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.686278+00	2025-08-17 16:27:08.686278+00	\N
291f05bb-87de-44c7-b82f-586471e7880c	james.brown@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	cb7bd4d2-dd4f-4f3e-ac59-0a62a347c699	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.688046+00	2025-08-17 16:27:08.688046+00	\N
2d916f4a-08c9-46f8-98b6-4f7eefd1cb98	ashley_king@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	4ca5e3bb-818b-4ea2-bdc4-302ba84030dd	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.888539+00	2025-08-17 16:27:08.888539+00	\N
5bbb0a5b-529a-4a00-aa28-db3d4b402838	ashley.king@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	4ca5e3bb-818b-4ea2-bdc4-302ba84030dd	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.890883+00	2025-08-17 16:27:08.890883+00	\N
bfd4ef95-3855-41c3-ad3f-06b1080ef199	matthewwright@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	29785965-f1d8-404b-b676-66eb57674d18	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.908104+00	2025-08-17 16:27:08.908104+00	\N
3ae99ef8-e693-4b4e-8ad1-ec8bc2c18426	matthew.wright@corp.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	29785965-f1d8-404b-b676-66eb57674d18	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.910219+00	2025-08-17 16:27:08.910219+00	\N
7bfc1871-847f-4a9a-a75e-6b9b9a9b428b	lauren_lopez@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	1c682b6d-deb0-4f45-b6f5-7fa15e022d6a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.924191+00	2025-08-17 16:27:08.924191+00	\N
22374856-0159-4255-8908-96f88a3fd3a1	lauren.lopez@enterprise.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	1c682b6d-deb0-4f45-b6f5-7fa15e022d6a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.926054+00	2025-08-17 16:27:08.926054+00	\N
ecb3ca0e-c02f-46b9-ae4c-b4e8478b756b	joshua.hill@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	d8447d3f-b609-4082-8465-a011f51df931	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.939204+00	2025-08-17 16:27:08.939204+00	\N
ce659b9c-b1a0-4756-80b0-2145c6d524f1	megan_scott@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	930ee9a5-7dc6-4c0e-aaa2-2ff6e58600a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.958243+00	2025-08-17 16:27:08.958243+00	\N
2c42d7bf-d1de-4b6c-887e-b48968f28628	megan.scott@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	930ee9a5-7dc6-4c0e-aaa2-2ff6e58600a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.960179+00	2025-08-17 16:27:08.960179+00	\N
d80d29b1-eaae-4d1f-8e83-6d6f66c0ca2a	justin.green@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	f980c170-c4ff-43bc-8a6e-1ffccdfc71e7	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.973773+00	2025-08-17 16:27:08.973773+00	\N
e81209bd-e180-4e97-bf37-8878e61393e7	hannah.adams@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	26a14cfc-424f-42fc-98b0-ca7ddc12563b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.995995+00	2025-08-17 16:27:08.995995+00	\N
97c034ef-d021-4f44-9ecd-eaa9ed24444c	hannah.adams@corp.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	26a14cfc-424f-42fc-98b0-ca7ddc12563b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.000151+00	2025-08-17 16:27:09.000151+00	\N
8fdbc73d-6f85-40ec-a6a1-b6fbfc56ab61	brandon_baker@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	34e3d58a-7972-48bc-9763-70f81fff7047	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.019229+00	2025-08-17 16:27:09.019229+00	\N
cb5e7dc8-421e-4651-a8bf-81e820c9e8d2	brandon.baker@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	34e3d58a-7972-48bc-9763-70f81fff7047	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.020995+00	2025-08-17 16:27:09.020995+00	\N
bd57fef8-f14b-494f-94bc-6979c2a31c77	kaylagonzalez887@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	3931d0ed-21f3-4c42-9c46-9d109fb49efe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.035035+00	2025-08-17 16:27:09.035035+00	\N
56e65e60-e934-44f6-b5f3-fceee0d284ac	tyler.nelson@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	222a3bcf-c11d-4357-af01-e73a23bfe2fb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.050283+00	2025-08-17 16:27:09.050283+00	\N
00c27b75-99cf-4699-8251-59941aee96b5	tyler.nelson@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	222a3bcf-c11d-4357-af01-e73a23bfe2fb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.052653+00	2025-08-17 16:27:09.052653+00	\N
cd970907-02d8-4336-8b1c-9f2f2f631499	alexandra_carter@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	ba177b04-db10-4ecf-ac88-5420d22d6a24	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.07001+00	2025-08-17 16:27:09.07001+00	\N
21191130-7be3-4178-8801-198bc7888238	alexandra.carter@enterprise.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	ba177b04-db10-4ecf-ac88-5420d22d6a24	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.071918+00	2025-08-17 16:27:09.071918+00	\N
8e0d8fe0-ad63-49bc-aebe-7c34cb14147c	zacharymitchell459@yahoo.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	aa802da1-5d54-4fae-a6e5-b34cf705cbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.088639+00	2025-08-17 16:27:09.088639+00	\N
d6721dc6-3de3-4d13-a340-2aca72d04114	zachary.mitchell@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	aa802da1-5d54-4fae-a6e5-b34cf705cbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.090423+00	2025-08-17 16:27:09.090423+00	\N
5e3f3fb1-50be-45fc-a60c-0521da939244	victoria_perez@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	85eae53c-da16-4325-af27-990fa897ef7c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.107153+00	2025-08-17 16:27:09.107153+00	\N
6e2bfd2a-bce2-45ba-9bc1-89e6b8ccd4f4	nathan.roberts@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	5eb898e5-99f9-4347-b46f-5856733e4b9c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.12259+00	2025-08-17 16:27:09.12259+00	\N
7f290c8d-75b3-4676-a083-0c0d2ce013d2	samanthaturner329@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	dccfe585-17f2-48de-bdb4-5cf2854f339a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.136664+00	2025-08-17 16:27:09.136664+00	\N
5c750005-d2b2-4311-aeb2-b604000a3864	eric_phillips@icloud.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	951e604b-e969-4eca-8a13-c809f9c33ea9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.145603+00	2025-08-17 16:27:09.145603+00	\N
cc8e7526-4e14-4456-81fe-73857a72204f	rebecca_campbell@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	1b3a6439-679b-4f20-8346-976b28e5b77c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.159531+00	2025-08-17 16:27:09.159531+00	\N
e106c7d8-d319-48c3-ab77-a76d038be208	rebecca.campbell@business.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	1b3a6439-679b-4f20-8346-976b28e5b77c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.161821+00	2025-08-17 16:27:09.161821+00	\N
f0fe99a4-dcfb-45a7-add0-4788a68620b0	adam_parker@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	0e896c9c-119e-46c2-8abd-fb981c795ce5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.17562+00	2025-08-17 16:27:09.17562+00	\N
b789f3fb-751b-4863-909c-a1adcfaf881d	adam.parker@business.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	0e896c9c-119e-46c2-8abd-fb981c795ce5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.177508+00	2025-08-17 16:27:09.177508+00	\N
f0e15d02-d9ee-4067-ac01-41df3cd84daf	michelle_evans@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	f824d895-18f5-4344-9ff7-bfb76ab6df98	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.190839+00	2025-08-17 16:27:09.190839+00	\N
3f694cab-08a0-4f7b-b2ef-5f8130e94abc	michelle.evans@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	f824d895-18f5-4344-9ff7-bfb76ab6df98	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.192756+00	2025-08-17 16:27:09.192756+00	\N
64e3d960-4bb1-43f5-aa6a-1df42bbec7de	steven.edwards@icloud.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	6420c0a8-291d-4c42-b228-89764cde3686	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.207106+00	2025-08-17 16:27:09.207106+00	\N
3658be3d-88a3-46e1-9e01-9dc91e310b18	steven.edwards@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	6420c0a8-291d-4c42-b228-89764cde3686	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.209405+00	2025-08-17 16:27:09.209405+00	\N
49dba78a-32cc-482d-8c5e-6729195fa529	amber_collins@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	c0f35d3a-9c2d-4f7b-a6bb-1f92c55c415c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.22235+00	2025-08-17 16:27:09.22235+00	\N
82e626b7-a3ee-46e6-9410-539b6a8f4522	timothy_stewart@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	6e859df2-22d8-41b6-99d4-dfceab790528	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.239322+00	2025-08-17 16:27:09.239322+00	\N
cdebe82d-2f9a-4e09-a255-475b37e67766	timothy.stewart@business.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	6e859df2-22d8-41b6-99d4-dfceab790528	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.241392+00	2025-08-17 16:27:09.241392+00	\N
939b20dd-0274-4221-bebc-f1e355a35477	danielle_sanchez@hotmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	4375098f-16fc-4d28-b962-52c7396818c8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.254317+00	2025-08-17 16:27:09.254317+00	\N
d8600e5a-799d-4761-9c4e-2413bbaaef06	danielle.sanchez@company.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	4375098f-16fc-4d28-b962-52c7396818c8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.25627+00	2025-08-17 16:27:09.25627+00	\N
8bf83abc-360c-47f6-b33b-5134ca12ae95	kyle.morris@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	1d1adc78-f37f-4139-8f20-987ee464e4ab	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.272853+00	2025-08-17 16:27:09.272853+00	\N
ecd8cc35-1914-49e0-aa52-b8c4938a37c3	brittany_rogers@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	a188730d-46cd-4d96-bbb3-6cb5f4edcc3e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.292935+00	2025-08-17 16:27:09.292935+00	\N
d7d679d6-10da-4446-bcf7-4e279d969432	jeffrey_reed@icloud.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	fc0b81a6-fa60-4908-8cf3-8de83e8dac14	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.310151+00	2025-08-17 16:27:09.310151+00	\N
58939003-f15c-43cf-a6d3-308fa05a4388	jeffrey.reed@enterprise.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	fc0b81a6-fa60-4908-8cf3-8de83e8dac14	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.312381+00	2025-08-17 16:27:09.312381+00	\N
0bc0d9ef-8f94-4c35-9535-c24148067f9d	courtney.cook@gmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	751ac3d4-abfb-4e44-bb2e-5eb440e1a95c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.324661+00	2025-08-17 16:27:09.324661+00	\N
6caa8d1a-e0a6-4d1f-baf2-569d7da6d452	courtney.cook@company.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	751ac3d4-abfb-4e44-bb2e-5eb440e1a95c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.326944+00	2025-08-17 16:27:09.326944+00	\N
b13a724b-95f3-4f81-91cd-27d8a2839500	markmorgan819@yahoo.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	8b644611-c702-4925-840e-f9fcb2d7e49e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.341421+00	2025-08-17 16:27:09.341421+00	\N
04b357ea-6553-45e0-b8af-b6fa6330b0e5	mark.morgan@enterprise.com	f	f	03ee8151-fd6c-4d31-8b61-e9c8e786450b	8b644611-c702-4925-840e-f9fcb2d7e49e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.344452+00	2025-08-17 16:27:09.344452+00	\N
151e02d7-8cce-46ae-9957-1d6305e9c411	tiffany.bell@hotmail.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	a3694834-ba15-417f-bc5f-f0ef8f32829a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.358612+00	2025-08-17 16:27:09.358612+00	\N
34c63f61-bfdf-47c6-8c9b-bf0d4f4e873e	tiffany.bell@enterprise.com	f	t	03ee8151-fd6c-4d31-8b61-e9c8e786450b	a3694834-ba15-417f-bc5f-f0ef8f32829a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.361266+00	2025-08-17 16:27:09.361266+00	\N
152a6a9c-d147-4349-b1bd-f17bda389e68	brianmurphy665@outlook.com	t	t	cf571e53-cc14-44cb-8a61-d195223ea970	e9b09322-628a-43e7-8c24-47eeb0242ccb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.376866+00	2025-08-17 16:27:09.376866+00	\N
\.


--
-- Data for Name: industries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.industries (id, name, code, description, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
bd53cb65-5771-469f-8a74-3c843566505b	Technology	TECH	\N	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.158963+00	2025-08-14 10:06:11.158963+00	\N
c94caae6-5d0c-449e-939d-58ef35462ddb	Healthcare	HEALTHCARE	\N	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.162046+00	2025-08-14 10:06:11.162046+00	\N
da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	Finance	FINANCE	\N	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.165838+00	2025-08-14 10:06:11.165838+00	\N
107996e0-1768-4ce1-85ef-6b7e5e5830e6	Manufacturing	MANUFACTURING	\N	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.168551+00	2025-08-14 10:06:11.168551+00	\N
ed699425-b383-4835-8ce4-e180956ac4fe	Retail	RETAIL	\N	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.172016+00	2025-08-14 10:06:11.172016+00	\N
\.


--
-- Data for Name: lead_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lead_statuses (id, name, code, description, color, "order", is_active, is_system, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
dac58300-a121-423c-88d6-40b920010b01	New	NEW	\N	#3B82F6	1	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.138357+00	2025-08-14 10:06:11.138357+00	\N
875d0d12-2623-436b-bdcc-cbf5925d2483	Contacted	CONTACTED	\N	#F59E0B	2	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.141485+00	2025-08-14 10:06:11.141485+00	\N
7ca5b2a7-ba91-44c1-93d1-c65597bcf834	Qualified	QUALIFIED	\N	#10B981	3	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.143955+00	2025-08-14 10:06:11.143955+00	\N
fef00eb6-316e-4544-aeb2-2b7292774fcd	Unqualified	UNQUALIFIED	\N	#EF4444	4	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.146459+00	2025-08-14 10:06:11.146459+00	\N
\.


--
-- Data for Name: lead_temperatures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lead_temperatures (id, name, code, description, color, "order", is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
71907089-3599-4f63-bdbd-6ade8988e5ff	Hot	HOT	\N	#EF4444	1	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.150442+00	2025-08-14 10:06:11.150442+00	\N
efd60c77-2ec7-475c-96ec-2abeaee51158	Warm	WARM	\N	#F59E0B	2	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.153747+00	2025-08-14 10:06:11.153747+00	\N
2d5c9742-c4c9-4510-b703-ae83b908a250	Cold	COLD	\N	#3B82F6	3	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.156341+00	2025-08-14 10:06:11.156341+00	\N
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leads (id, first_name, last_name, title, status_id, temperature_id, source, campaign, score, company_id, contact_id, assigned_user_id, marketing_source_id, converted_at, converted_to_deal_id, tenant_id, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: marketing_asset_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_asset_types (id, name, code, description, color, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: marketing_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_assets (id, name, type_id, url, content, views, clicks, conversions, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: marketing_source_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_source_types (id, name, code, description, color, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: marketing_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_sources (id, name, type_id, medium, campaign, source, content, term, utm_source, utm_medium, utm_campaign, utm_content, utm_term, cost, impressions, clicks, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, subject, content, type, direction, status, "scheduledAt", "sentAt", metadata, "createdAt", "updatedAt", "contactId", "dealId", "leadId", "assignedToId", "createdById") FROM stdin;
\.


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notes (id, title, content, type, metadata, "createdAt", "updatedAt", "contactId", "dealId", "leadId", "assignedToId", "createdById") FROM stdin;
\.


--
-- Data for Name: phone_number_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.phone_number_types (id, name, code, description, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
c44a42be-cb00-4b09-aba8-7cc55a1b58ab	Mobile	MOBILE	Mobile phone number	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.452194+00	2025-08-15 08:15:49.452194+00	\N
6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	Work	WORK	Work phone number	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.459968+00	2025-08-15 08:15:49.459968+00	\N
47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	Home	HOME	Home phone number	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.462146+00	2025-08-15 08:15:49.462146+00	\N
36466fc7-9a3f-4619-9a80-8634c536ab09	Fax	FAX	Fax number	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.46419+00	2025-08-15 08:15:49.46419+00	\N
\.


--
-- Data for Name: phone_numbers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.phone_numbers (id, number, extension, is_primary, type_id, entity_id, entity_type, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
5a8f88b1-94d8-49f1-a4d8-651c7d7aced7	+1 (555) 123-4567	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	7eed624f-9925-4f80-9146-ae820be0e58f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.854765+00	2025-08-18 14:22:23.854765+00	\N
b15a8440-ff0a-4730-afad-c0d466842d2f	852 9168 9000	\N	t	\N	2eca6953-1955-4a82-9e1e-4ffb7a89a912	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:23:30.022377+00	2025-08-18 02:23:30.022377+00	\N
f6ce4644-1174-414b-93b6-00ced4beb84e	7689078568975	\N	t	\N	78181568-b3e1-4765-a657-38ccecc3bf26	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:04:21.962833+00	2025-08-17 13:04:21.962833+00	\N
07698be7-15f9-4ef3-bbcc-7b159a6927a0	7689078568975	\N	t	\N	abb14855-358b-457e-9499-e069ceffc550	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:04:33.753785+00	2025-08-17 13:04:33.753785+00	\N
bbdd7127-733f-4973-9509-8bd99e58bd20	+1 (555) 111-2222	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	48434ee4-b741-492a-81f3-91519de02819	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.863222+00	2025-08-18 14:22:23.863222+00	\N
01305eeb-199b-4b90-83e9-c32d376b327e	+1 (555) 222-3333	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	a524b0ac-d7ab-4a84-a018-1b9da0151d15	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.872313+00	2025-08-18 14:22:23.872313+00	\N
3f0ddd02-dc42-4895-a03e-cf95a25b6a24	+1 (555) 333-4444	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	0df6cdfd-8f89-45ec-97c1-8a064eb59d7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.879386+00	2025-08-18 14:22:23.879386+00	\N
27da493a-9eb0-48a3-9d9d-76eab481942f	8889999222	\N	t	\N	8e678b0a-06cb-4b34-8a09-1a4542408ad8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:14:32.598594+00	2025-08-17 13:14:32.598594+00	\N
d063bdb2-183b-4013-9286-7dce999516e0	+1 (555) 234-5678	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	3e27031f-244c-43fd-b56e-257693adfa93	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.892+00	2025-08-18 14:22:23.892+00	\N
7e1cf1bf-e7e4-476a-80b1-8b689a6ddbe4	8889999222	\N	t	\N	80a691c5-750a-4b85-a070-956fbb0bcc12	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:14:44.848208+00	2025-08-17 13:14:44.848208+00	\N
56205555-3db5-4b6d-b641-25c542e7753f	+1 (555) 111-2222	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	09e37143-1951-4511-8f1f-3aac3bad777e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.902127+00	2025-08-18 14:22:23.902127+00	\N
52ec5a6e-92b7-41f2-8223-2ab84af26ba4	555-999-8888	\N	t	\N	26989bab-7b6a-46c0-bf60-daf49dd2fe30	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:19:05.338175+00	2025-08-17 13:19:05.338175+00	\N
54332cb6-fc07-4c44-964a-09135cfe95ab	(206) 140-5128	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	0bf8c763-2842-49b2-b0e9-4a26ec1735c4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.579547+00	2025-08-17 13:44:22.579547+00	\N
29a5bdd3-eac4-4f98-8bb1-6cd256afa432	+1 (555) 222-3333	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	75a13a2a-9045-490e-a359-b597bf5aee59	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.908937+00	2025-08-18 14:22:23.908937+00	\N
6d04c98f-e72e-4f19-8bb7-413c493baf1c	+1 (555) 333-4444	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	9c5f4ad2-4e14-4869-bb4c-fcefbf412421	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.915637+00	2025-08-18 14:22:23.915637+00	\N
50c283b3-b6d4-4328-8c3f-002c3858234b	+1 (555) 345-6789	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	f621f36e-7519-4b45-9722-f6afb1e1b2d4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.926169+00	2025-08-18 14:22:23.926169+00	\N
97373834-fbac-4957-a69a-fae2061b2bc3	+1 (555) 111-2222	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	e5c1ea2b-953d-4a36-9259-2d9f67990727	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.93336+00	2025-08-18 14:22:23.93336+00	\N
5bd4bc1f-78cb-419c-8583-981cdfa4a168	+1 (555) 222-3333	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	06a27fba-d6d1-4181-a8e6-504ccb8c18dd	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.941093+00	2025-08-18 14:22:23.941093+00	\N
5c328d70-f7d7-4517-afad-81cfe10d3501	+1 (555) 333-4444	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	2fa04312-6fdf-48ef-b97b-4140d71aa371	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.947365+00	2025-08-18 14:22:23.947365+00	\N
a936ac86-0564-42cc-8253-8f3a1b8f9599	+1 (555) 456-7890	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	0aa76ff6-c0ff-42be-aba5-dc6675822269	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.957818+00	2025-08-18 14:22:23.957818+00	\N
18182dd7-4e9f-47d4-844f-540b0ef6ccf9	+1 (555) 111-2222	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	020f0aea-f3e4-440c-a460-e07a253a213f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.963919+00	2025-08-18 14:22:23.963919+00	\N
6baea886-d178-43a2-bffe-51a1daa30194	+1 (555) 222-3333	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	c208a55d-bcfb-4722-b5f6-b3d734b55fda	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.971662+00	2025-08-18 14:22:23.971662+00	\N
277b37e2-f604-4eeb-baee-1201986c41c2	+1 (555) 333-4444	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	4662ccd3-31b9-4af0-9a95-451120024bb8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.981348+00	2025-08-18 14:22:23.981348+00	\N
e03c1469-23c9-42e4-8188-829c38ff40ad	+1 (555) 567-8901	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	81c00860-f07b-4d75-a3fc-06c4d811151f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:23.99239+00	2025-08-18 14:22:23.99239+00	\N
ed00bf41-3c60-4b5b-984b-1792defbb961	+1 (555) 111-2222	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	e0bc6b84-16f9-4c0c-9b6e-686b5f97bde3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.000536+00	2025-08-18 14:22:24.000536+00	\N
fc2cdeb4-ad4c-4aa0-af47-ece3855a5bb3	+1 (555) 222-3333	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	7b58e1a4-a308-4c03-945a-638be63fd87f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.007643+00	2025-08-18 14:22:24.007643+00	\N
8a257a82-2495-4613-8fff-9e1efa914cb5	+1 (555) 333-4444	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	f2226b9e-de07-44ea-a765-44d296f9eac6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.013863+00	2025-08-18 14:22:24.013863+00	\N
f431de51-cd65-4fdf-8249-97b32afcf41d	+1 (555) 678-9012	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	b184b112-eb53-484d-ac9d-b02e9b731845	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.025411+00	2025-08-18 14:22:24.025411+00	\N
057f35c4-b1f8-4e37-9644-40a01409285f	+1 (555) 789-0123	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	2b1b3817-65a1-4899-b31e-cc4a16a1569d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.036839+00	2025-08-18 14:22:24.036839+00	\N
1ebca460-dd08-4d9d-9a17-dfd391b03a7e	+1 (555) 890-1234	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	0ac551ec-5265-40ba-bb3e-089488d0f3ff	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.045597+00	2025-08-18 14:22:24.045597+00	\N
a540d2b0-c37d-41c6-a7d8-97597049ef98	+1 (555) 111-2222	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	c0d318cd-d5ae-4e16-ad0c-bfe6058d12e0	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.054468+00	2025-08-18 14:22:24.054468+00	\N
6f90da22-b935-4d3c-a275-58660183fa91	+1 (555) 222-3333	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	2a202130-6cc6-433b-a6f6-b03191c6c6bc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.062343+00	2025-08-18 14:22:24.062343+00	\N
bb89b00a-2fd2-4577-a69c-5aa80bc4832f	+1 (555) 333-4444	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	ecfb1de9-991e-4e5d-bce1-482f0aa7333a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.07125+00	2025-08-18 14:22:24.07125+00	\N
6d4abf91-474e-457b-aa1f-5098b0e7d714	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	4f618057-25ed-4470-874d-7aa321803990	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.080784+00	2025-08-18 14:22:24.080784+00	\N
d717cbdb-7e56-4d84-b560-a5e78c6b6e2f	+1 (555) 012-3456	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	ebd8f8ff-535f-4198-b946-38862419a922	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 14:22:24.091644+00	2025-08-18 14:22:24.091644+00	\N
02c3e5c1-dcd6-45a7-ab1d-fee1ef1d1ad5	+1 (555) 789-0123	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	e124301d-e9af-42c1-a361-0c0882547f7a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.239546+00	2025-08-18 18:01:56.239546+00	\N
ea51de06-bad5-42c7-8b29-4db2031ce768	+1 (555) 012-3456	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	b5de6862-01e7-4e04-a831-3dfe95563c9c	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.253854+00	2025-08-18 18:01:56.253854+00	\N
9635673c-4caa-4840-9523-bf2b7d81abce	+1 (555) 789-0123	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	7d89c2bd-9fd9-4bf2-b5f9-644e244afe65	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.259078+00	2025-08-18 18:01:56.259078+00	\N
01a3a0b0-ba0d-499f-aa48-2786910a30cf	+1 (555) 123-4567	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	6b2e822a-b5c8-480d-ac5e-7a3e0ec78e98	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.263913+00	2025-08-18 18:01:56.263913+00	\N
d960c401-729f-49c7-b33f-808b3917d641	+1 (555) 123-4567	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	8152c747-c080-46cb-86a4-730ef9e79f7b	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.268968+00	2025-08-18 18:01:56.268968+00	\N
986dd667-a82f-424f-8e1c-9ef1c239769c	+1 (555) 678-9012	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	cc5c3527-dc17-48b7-830e-c24d5378861a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.273762+00	2025-08-18 18:01:56.273762+00	\N
f70b3d54-6ca2-4c06-95c0-165b1da83830	+1 (555) 789-0123	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	30d8b0b0-2d20-427f-a456-f261f662ba99	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.278245+00	2025-08-18 18:01:56.278245+00	\N
aea6cf8a-6d50-490e-98d1-6102dc081063	+1 (555) 123-4567	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	82394f79-e8ee-41c9-94bf-1ff2acad6975	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.282451+00	2025-08-18 18:01:56.282451+00	\N
0e856159-9b6d-416a-bdd9-bbac15b4594f	+1 (555) 234-5678	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	91ebf292-9cfc-494d-957e-ee34f9137fec	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.287037+00	2025-08-18 18:01:56.287037+00	\N
041e486a-9862-4272-8620-342bf8b55143	+1 (555) 345-6789	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	570512eb-aabf-42b9-b485-3df0effee807	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.291441+00	2025-08-18 18:01:56.291441+00	\N
bdf6ef0c-f722-42e9-9916-35f06200913a	+1 (555) 890-1234	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	af5e910f-9054-4c3f-b509-c3815aaade72	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.295432+00	2025-08-18 18:01:56.295432+00	\N
446ebb34-3b01-43c9-bc32-4f67eee55e4b	+1 (555) 456-7890	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	e8849080-2368-478d-b4ce-b87ebd7974b2	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.299841+00	2025-08-18 18:01:56.299841+00	\N
b831e9c4-a313-4f6f-9a78-629e442742a9	+1 (555) 123-4567	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	e23a12d3-3380-4918-ac31-39bfe80a8211	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.304468+00	2025-08-18 18:01:56.304468+00	\N
71aea35d-bce0-4e18-ab7b-2bee016843a3	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	50ea3d2c-f3e3-4460-ad34-49bdb87a325a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.308578+00	2025-08-18 18:01:56.308578+00	\N
13373e09-8778-4a15-b551-caf7d0f35467	+1 (555) 789-0123	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	04ba9ed7-7b34-4442-9fae-6367d79481cf	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.312731+00	2025-08-18 18:01:56.312731+00	\N
e1c51770-c190-4508-867a-c72a1646c930	+1 (555) 678-9012	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	d6d87d98-9660-4cfc-85c0-2e2df0ebe0e9	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.316952+00	2025-08-18 18:01:56.316952+00	\N
7f139a78-b50e-4a50-a7f9-10910374fd74	+1 (555) 012-3456	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	ec4f7848-824e-4fb6-9551-ea1473dcfb3f	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.321366+00	2025-08-18 18:01:56.321366+00	\N
d0551b02-2f85-4eee-b6b9-127b42f601f5	+1 (555) 234-5678	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	ca85637b-3852-444f-af3f-a42b032191be	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.32699+00	2025-08-18 18:01:56.32699+00	\N
1d4533b2-8e36-4c68-96ca-733fefa9857a	+1 (555) 890-1234	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	7c7644ee-cb23-4dfb-8ed5-39edae86c278	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.331522+00	2025-08-18 18:01:56.331522+00	\N
c7ee10ad-d856-4c2f-98a4-74212e633a20	+1 (555) 012-3456	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	6c1effb0-40d8-4e3c-ad9a-1a80f7371bf6	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.33589+00	2025-08-18 18:01:56.33589+00	\N
e8cc2715-2e77-4866-82cf-c196cc2ef0a4	+1 (555) 345-6789	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	9dc9056f-a165-4002-a9a6-552dd5305f7a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.339978+00	2025-08-18 18:01:56.339978+00	\N
ef2e1a02-be80-4377-9dac-2cedd9fa8a32	+1 (555) 345-6789	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	005fd3c7-3b66-4d04-a14f-c719a3147f1d	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.343961+00	2025-08-18 18:01:56.343961+00	\N
d5396fed-2f0e-46c2-a367-1af8b63bd79d	+1 (555) 345-6789	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	a438d48a-ee50-448e-852e-7a7d4d5c704b	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.347976+00	2025-08-18 18:01:56.347976+00	\N
88823b1c-4aa0-4ae6-9cf3-34cf7cd91e42	+1 (555) 678-9012	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	216032e1-d6c7-4a1f-a012-08c08b627b8d	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.352355+00	2025-08-18 18:01:56.352355+00	\N
8c79dbf6-604c-4cf1-92a1-80516ef12e4d	+1 (555) 345-6789	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	a8eb5b3c-2efc-40f7-b64b-e05ce198507d	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.35651+00	2025-08-18 18:01:56.35651+00	\N
e9d0b7bb-dcab-4a99-b40d-2fbda64f13ca	+1 (555) 345-6789	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	139e04fa-bdec-43d5-bb91-2848815d7a07	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.360766+00	2025-08-18 18:01:56.360766+00	\N
5cd49f1c-a3ac-405c-a8db-62344fb3130a	+1 (555) 234-5678	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	63ac9507-3b40-4410-96f6-deaf949d8aa9	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.364698+00	2025-08-18 18:01:56.364698+00	\N
09575b40-0de4-48fb-b97f-710f866a8828	+1 (555) 123-4567	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	ea6652d1-dbd5-4bee-a831-60b6aacd706a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.369763+00	2025-08-18 18:01:56.369763+00	\N
fc8cba5c-ab01-44be-b279-a90a4562a7f7	+1 (555) 890-1234	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	be65e1b5-8ce7-4426-b5f8-1625321a854c	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.374386+00	2025-08-18 18:01:56.374386+00	\N
3d9301cf-4ccb-4519-8ffc-11b0e0bd7392	+1 (555) 890-1234	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	a3933216-7f83-41aa-953a-c805b5c47789	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.378318+00	2025-08-18 18:01:56.378318+00	\N
193160c3-04de-42f9-b88e-3e734d25a0d8	+1 (555) 456-7890	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	cfca2e1f-8426-47f9-b582-07400862bd4c	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.382668+00	2025-08-18 18:01:56.382668+00	\N
a85cd8f4-0bfd-40ff-aaca-67f8d844e974	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	35b59ce3-077f-4ea3-b57d-afc7b50e6613	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.387874+00	2025-08-18 18:01:56.387874+00	\N
fa4d2dae-f689-4820-a727-60a46e2d2dc4	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	64c5858d-837d-4ad3-9878-cf5d29e7dd56	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.393138+00	2025-08-18 18:01:56.393138+00	\N
c6f14754-5c13-4c47-b864-b718bb40987f	+1 (555) 456-7890	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	01be7874-0098-4ec5-9d48-9393ca57bc98	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.39904+00	2025-08-18 18:01:56.39904+00	\N
71b2b2a2-3f8a-4556-a036-e4c7d2061277	+1 (555) 789-0123	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	a94483dd-5541-4a47-a4ff-7fca34c3c0dc	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.404718+00	2025-08-18 18:01:56.404718+00	\N
f704067b-01e5-47ee-8e14-3adadc702ff1	+1 (555) 890-1234	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	1f8f16a7-3562-4df8-bbdc-a0e4b6e14cee	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.409335+00	2025-08-18 18:01:56.409335+00	\N
6055f044-2ab2-4e1b-ae28-81a3ba749501	+1 (555) 678-9012	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	446386c2-676b-47e4-bf0b-e05774eb791a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.414963+00	2025-08-18 18:01:56.414963+00	\N
ac15fd53-561b-43ef-8073-01b93827b2f0	+1 (555) 890-1234	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	88463116-9630-499e-8ae9-76aeacf2851f	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.42027+00	2025-08-18 18:01:56.42027+00	\N
b73890a7-547a-4a8f-8d00-d30c27071e8b	+1 (555) 234-5678	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	233915d4-3561-4a96-b8f4-539aee58d54a	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.424853+00	2025-08-18 18:01:56.424853+00	\N
b8aa044e-ff27-4854-afba-be1f765134c4	+1 (555) 789-0123	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	08d8f3c1-53ff-4445-9832-a1b02b3e0a98	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.428908+00	2025-08-18 18:01:56.428908+00	\N
c02883c1-a3dc-4f4e-b6c7-075bb01fa0bf	+1 (555) 012-3456	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	4ccc9467-319f-468b-9b6a-ce29a5195ed6	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.433181+00	2025-08-18 18:01:56.433181+00	\N
a34247c1-b50d-43fe-aee4-f6d83ce56ea1	+1 (555) 012-3456	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	f95d5433-17a8-4a25-8a87-dfad8ac5793d	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.4384+00	2025-08-18 18:01:56.4384+00	\N
2affccca-6b62-412b-b480-fbe333aef424	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	c920fe2a-7619-46cf-80cd-18d08eceba2b	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.443163+00	2025-08-18 18:01:56.443163+00	\N
9f3a65ca-375a-42d7-b14f-b3b85b1a85fc	+1 (555) 678-9012	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	1de20cb2-4b55-4a4d-9eba-f10e78c4e09f	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.447271+00	2025-08-18 18:01:56.447271+00	\N
96bbe064-eca0-4598-bca3-8ccd910c5d45	+1 (555) 012-3456	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	6d8cd793-a016-4ab7-9b39-b65b6aaecd0e	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.454229+00	2025-08-18 18:01:56.454229+00	\N
10eb3c3e-9090-45a7-9060-f43dc19104ac	+1 (555) 123-4567	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	c2c99d42-6aab-4af6-9f5f-1c9833d34799	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.460551+00	2025-08-18 18:01:56.460551+00	\N
89153d7c-7364-4d40-92f7-7e38ea127956	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	d0f76f75-3ae1-4cdd-9992-834dd2c73352	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.465243+00	2025-08-18 18:01:56.465243+00	\N
01d7569b-cbce-44d4-b5af-130ea6be1720	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	44559722-1c94-4a08-a4ca-e261232fc1dc	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.469599+00	2025-08-18 18:01:56.469599+00	\N
b6939b0f-5977-4c2f-8fcb-febc5d7e0109	+1 (555) 012-3456	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	79920099-87c1-4d41-a729-e0d094024b16	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.473574+00	2025-08-18 18:01:56.473574+00	\N
8e2bb4df-2778-4fd2-9642-3d8404854cb2	+1 (555) 234-5678	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	cf8480e6-4b3d-4019-8609-55d1c281f9da	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.480695+00	2025-08-18 18:01:56.480695+00	\N
36e0877d-c02b-48db-a7f4-b48c6f23f292	+1 (555) 345-6789	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	63b90681-c4e2-4cbb-befc-fa91dff784ff	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.485449+00	2025-08-18 18:01:56.485449+00	\N
ceb83ec0-b771-4162-9f85-64fc5aef4df3	+1 (555) 345-6789	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	34021023-0fb6-4c0d-9bcd-d6837527fbeb	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.489879+00	2025-08-18 18:01:56.489879+00	\N
635edfc2-3d1e-4fa9-b5a0-75c8ba24899f	+1 (555) 012-3456	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	3a794c42-3fba-4420-9429-e8f748b8df62	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.494631+00	2025-08-18 18:01:56.494631+00	\N
cb5b0679-f5d8-4b24-a2b3-d75dc8f5d8f0	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	9c4b0c2c-a0c0-4a83-b3e0-a49720c81efa	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.500024+00	2025-08-18 18:01:56.500024+00	\N
ec2b8ceb-b190-4e5d-9969-f0f7804e68a0	+1 (555) 234-5678	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	5dd6c10e-e69f-4605-af41-15a4bfcd08b9	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.504593+00	2025-08-18 18:01:56.504593+00	\N
d7586aee-cc7f-41ae-9a6a-3ed90f453c94	+1 (555) 567-8901	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	6e29d6c2-227a-4659-8e7c-dd92252ab48e	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.508971+00	2025-08-18 18:01:56.508971+00	\N
25793363-296c-46d0-8124-bc8b3ef96a3b	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	57067e69-33eb-49da-aa15-16734a81c54c	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.514203+00	2025-08-18 18:01:56.514203+00	\N
000ae877-9843-4197-ad8a-3a3ab6c17fa1	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	e1610917-e0ac-4ca7-b679-41f9fd999ede	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.519052+00	2025-08-18 18:01:56.519052+00	\N
dfd0b592-4981-416a-8883-083b8c622e32	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	6ebdf198-7536-4165-a182-8662e0669bcc	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.523631+00	2025-08-18 18:01:56.523631+00	\N
fe062abb-8293-4ebe-a1d4-3a35617efffd	+1 (555) 234-5678	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	cf676777-5028-4d3b-b495-86915b78be21	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.527702+00	2025-08-18 18:01:56.527702+00	\N
db634559-4296-41e3-8915-8af1a650b7f9	+1 (555) 456-7890	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	c22d69b8-2733-47dc-804d-fa156cb38bc2	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.532418+00	2025-08-18 18:01:56.532418+00	\N
39071e65-8585-413d-be2a-40346f80dcc2	+1 (555) 012-3456	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	2a130244-b3f6-4edd-b3e6-d3f17c4e386f	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.538118+00	2025-08-18 18:01:56.538118+00	\N
a429b8f9-95b0-4147-9699-835bf110091e	+1 (555) 890-1234	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	4774668c-86f8-47cf-b14d-9812528d4174	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.542963+00	2025-08-18 18:01:56.542963+00	\N
7ceadd81-4fb9-4797-8983-9146e9ed3f8b	+1 (555) 901-2345	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	215d54e5-9d5b-4afd-8491-6e6d627b29e2	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.548746+00	2025-08-18 18:01:56.548746+00	\N
e7a2c5ab-726c-4e4f-a9ef-f8e55fceca14	+1 (555) 890-1234	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	7e2eaea8-3dbb-46f4-a4f1-f6fa806ad4b9	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.555217+00	2025-08-18 18:01:56.555217+00	\N
e929928a-7038-4eb8-b876-3970de483f04	+1 (555) 123-4567	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	25365980-21fe-4da6-a1c8-2276fcc5510c	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.561045+00	2025-08-18 18:01:56.561045+00	\N
0f361a83-ffc6-49ac-a361-c4fd42c7d9f4	+1 (555) 567-8901	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	74b78071-20e8-4771-ac54-0b2972cac756	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.565509+00	2025-08-18 18:01:56.565509+00	\N
584649ef-2a73-4406-aabd-19c9d7bdfd20	+1 (555) 789-0123	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	5ec46438-0ab7-4d27-81c4-1c59a869ae20	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.570197+00	2025-08-18 18:01:56.570197+00	\N
54137329-8bab-4a59-96a8-4ecc791c0ee9	+1 (555) 456-7890	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	b8a09f47-b6dc-4d26-b0dc-d3104966cb47	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.576714+00	2025-08-18 18:01:56.576714+00	\N
99825cd1-640f-4218-a4c4-2aa5d7e9815d	+1 (555) 456-7890	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	46d2fb0a-b266-4519-b5d2-24ee89607cdc	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.581322+00	2025-08-18 18:01:56.581322+00	\N
77f50982-3338-4c78-8e04-72d25f8260cd	+1 (555) 567-8901	\N	t	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	276a631e-5c76-4110-a21d-6a565caf3a5b	Company	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 18:01:56.585789+00	2025-08-18 18:01:56.585789+00	\N
7c3268d6-4c13-4c40-b152-c9caab360709	(303) 638-4968	5919	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	0bf8c763-2842-49b2-b0e9-4a26ec1735c4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.583002+00	2025-08-17 13:44:22.583002+00	\N
91b53614-1e93-454b-aa4f-e105f3c35f1c	(206) 242-5574	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	79644c52-cd25-4489-800c-04a89d7a7861	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.593018+00	2025-08-17 13:44:22.593018+00	\N
dc75767f-3537-4b97-bf3b-7a30ccf69f18	(617) 382-1288	6133	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	79644c52-cd25-4489-800c-04a89d7a7861	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.595716+00	2025-08-17 13:44:22.595716+00	\N
8c6c30ab-66f1-4a45-940e-7c2f06508563	(617) 469-1181	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b52e1ec2-72b9-4daa-a152-e51c18212248	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.600838+00	2025-08-17 13:44:22.600838+00	\N
2451108c-977a-4c43-97b5-5e6e49e87847	(713) 816-1682	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f3975c04-6a1d-424a-a98e-a88199b671b3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.606992+00	2025-08-17 13:44:22.606992+00	\N
1417ab55-3a08-45c7-8f71-0badb0e033c9	(617) 264-7335	10835	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	f3975c04-6a1d-424a-a98e-a88199b671b3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.609804+00	2025-08-17 13:44:22.609804+00	\N
6410e6da-70af-46b4-8307-f1424b988416	(713) 522-2023	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	a53a16e5-cb11-4d7a-899b-f9e71e88bf9d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.614404+00	2025-08-17 13:44:22.614404+00	\N
7653bc0b-cf00-4bd6-a5de-2dfec77833eb	(415) 914-5436	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b8702a2e-e0f1-4176-8419-27442c0be258	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.620915+00	2025-08-17 13:44:22.620915+00	\N
09321df3-5732-4835-8c35-98e79164a3cf	(713) 399-4666	1426	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	b8702a2e-e0f1-4176-8419-27442c0be258	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.623647+00	2025-08-17 13:44:22.623647+00	\N
3e1c141f-4078-4a03-869e-fa355f862906	(404) 801-2419	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	455654b8-8ed2-4c6b-9988-4ff53f1c9ebe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.628476+00	2025-08-17 13:44:22.628476+00	\N
685d7988-ae3d-48f6-ac6b-7d66d7f6fe4d	(312) 604-2735	1271	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	455654b8-8ed2-4c6b-9988-4ff53f1c9ebe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.630144+00	2025-08-17 13:44:22.630144+00	\N
acb2abe4-dbde-44ca-be42-813f1b654953	(404) 783-5723	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2b918485-ff1a-422c-9066-4a29beca5fb1	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.634128+00	2025-08-17 13:44:22.634128+00	\N
57f139e0-4ba0-47d0-8b58-35b51e30044a	(404) 353-7507	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	87e258c1-c9eb-4c70-8fc6-22089060885d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.642669+00	2025-08-17 13:44:22.642669+00	\N
02501065-c271-4fa3-93a1-604b043dea75	(214) 112-5775	3581	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	87e258c1-c9eb-4c70-8fc6-22089060885d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.644535+00	2025-08-17 13:44:22.644535+00	\N
66e770aa-f603-4a94-b89a-eae599994538	(312) 627-6501	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f8b962a2-4cc9-47e3-9e22-9db5f797c95f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.6507+00	2025-08-17 13:44:22.6507+00	\N
82df44c2-1a18-4937-821d-6ce892c1ba17	(602) 964-7831	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f10d7250-7b11-4fd8-b79a-5c1db9f46cc6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.656692+00	2025-08-17 13:44:22.656692+00	\N
f996821a-9423-4d61-9311-671996bbac6e	(305) 721-7037	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	5417330b-bb97-44d5-9854-128d4ad23cc0	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.662723+00	2025-08-17 13:44:22.662723+00	\N
54962315-a056-4426-a453-f65cc589ad4e	(404) 674-4408	1787	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	5417330b-bb97-44d5-9854-128d4ad23cc0	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.665219+00	2025-08-17 13:44:22.665219+00	\N
e7f99344-ec9f-440f-bb6a-1686154061d0	(305) 423-5330	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	6cc01ce7-f735-45c6-9482-8f85001ae6b9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.67006+00	2025-08-17 13:44:22.67006+00	\N
7e4cc7af-c467-46b2-8384-77539c088a7e	(212) 473-9170	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	7c3cc563-ccc8-4efb-b40b-c63e0fa45cc3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.677075+00	2025-08-17 13:44:22.677075+00	\N
3b6a3c81-da7d-45b9-bcbe-e1b8fdbfddd2	(303) 607-1231	3215	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	7c3cc563-ccc8-4efb-b40b-c63e0fa45cc3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.678838+00	2025-08-17 13:44:22.678838+00	\N
3ebd5646-dd37-4f6b-8128-3f62b6978b69	(713) 257-4399	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	ea07c16d-f103-4381-8004-c7397487fd41	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.682767+00	2025-08-17 13:44:22.682767+00	\N
7eb261fc-3817-4444-866d-9761a010912e	(305) 682-3500	5655	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	ea07c16d-f103-4381-8004-c7397487fd41	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.684494+00	2025-08-17 13:44:22.684494+00	\N
d01055a7-4e48-49a4-a283-ec8d7d66fd94	(713) 557-8152	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	661d7e5f-1697-412d-94dd-28fb861173dc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.689798+00	2025-08-17 13:44:22.689798+00	\N
\.


--
-- Data for Name: pipelines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pipelines (id, name, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
dfb531fa-0093-43fd-ba8f-385f59a9e498	Default Sales Pipeline	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.188434+00	2025-08-14 10:06:11.188434+00	\N
\.


--
-- Data for Name: social_media_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_media_accounts (id, username, url, is_primary, type_id, entity_id, entity_type, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: social_media_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_media_types (id, name, code, icon, base_url, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
490abe08-dde2-4ea8-bdde-0be5a94bd952	LinkedIn	LINKEDIN	linkedin	https://linkedin.com/in/	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.48584+00	2025-08-15 08:15:49.48584+00	\N
15ebfb7f-7d7c-47ed-84af-370a7718b497	Twitter	TWITTER	twitter	https://twitter.com/	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.488753+00	2025-08-15 08:15:49.488753+00	\N
7a5c5332-3e24-4125-ab77-fc485ad8658b	Facebook	FACEBOOK	facebook	https://facebook.com/	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.491692+00	2025-08-15 08:15:49.491692+00	\N
d296fe4f-c51c-4607-ab40-b9590047742c	Instagram	INSTAGRAM	instagram	https://instagram.com/	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.493873+00	2025-08-15 08:15:49.493873+00	\N
\.


--
-- Data for Name: stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stages (id, name, "order", probability, is_closed_won, is_closed_lost, color, pipeline_id, tenant_id) FROM stdin;
318fc669-dd9d-4462-a8a5-c0587e45978d	Prospecting	1	10	f	f	#3B82F6	dfb531fa-0093-43fd-ba8f-385f59a9e498	4832fed8-e0b5-4f01-9b1c-09710c9a4555
f0b7b062-4d0b-42ac-b344-075d9e63f929	Qualification	2	25	f	f	#F59E0B	dfb531fa-0093-43fd-ba8f-385f59a9e498	4832fed8-e0b5-4f01-9b1c-09710c9a4555
cbb2b195-24ef-494b-944d-0be0d3c2fa31	Proposal	3	50	f	f	#8B5CF6	dfb531fa-0093-43fd-ba8f-385f59a9e498	4832fed8-e0b5-4f01-9b1c-09710c9a4555
452aac18-fa07-4b04-926c-e775e5dcf663	Negotiation	4	75	f	f	#EC4899	dfb531fa-0093-43fd-ba8f-385f59a9e498	4832fed8-e0b5-4f01-9b1c-09710c9a4555
fe527925-9168-4e2a-a44f-11d5b2f64eda	Closed Won	5	100	t	f	#10B981	dfb531fa-0093-43fd-ba8f-385f59a9e498	4832fed8-e0b5-4f01-9b1c-09710c9a4555
97fd1e39-43b7-4f66-bc24-4a03a89caae1	Closed Lost	6	0	f	t	#EF4444	dfb531fa-0093-43fd-ba8f-385f59a9e498	4832fed8-e0b5-4f01-9b1c-09710c9a4555
\.


--
-- Data for Name: task_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_types (id, name, code, description, color, icon, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, type_id, priority, status, due_date, completed_at, assigned_user_id, created_by, lead_id, deal_id, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, subdomain, is_active, settings, created_at, updated_at, deleted_at) FROM stdin;
4832fed8-e0b5-4f01-9b1c-09710c9a4555	Default Organization	default	t	\N	2025-08-14 10:06:11.125489+00	2025-08-14 10:06:11.125489+00	\N
\.


--
-- Data for Name: territories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.territories (id, name, type_id, countries, states, cities, postal_codes, industries, company_size, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: territory_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.territory_types (id, name, code, description, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, name, code, description, is_active, is_system, permissions, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
db4d49fe-3883-4104-85d3-bd165b4028a7	Administrator	ADMIN	Full system access	t	t	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.128648+00	2025-08-14 10:06:11.128648+00	\N
4896e3ec-ee5f-4fb7-b438-0a92c38058bb	Sales Manager	SALES_MANAGER	Sales management access	t	t	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.132419+00	2025-08-14 10:06:11.132419+00	\N
bdeb5d86-3b3e-4e70-b497-ec18475acd42	Sales Representative	SALES_REP	Sales representative access	t	t	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.13532+00	2025-08-14 10:06:11.13532+00	\N
\.


--
-- Data for Name: user_territories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_territories (territory_id, user_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, first_name, last_name, password, avatar, is_active, role_id, tenant_id, created_at, updated_at, created_by, deleted_at) FROM stdin;
7ed98e09-6460-49aa-8f9e-6efbe9ebffb7	tse@vib3cod3r.com	Ted	Tse	$2a$12$lqMyJw47tgCvC5mTvcHSS.iWseiuj7hVzwJBZYKQeT7ON4WyaUvvu	\N	t	db4d49fe-3883-4104-85d3-bd165b4028a7	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:28:54.836066+00	2025-08-14 10:28:54.836066+00	\N	\N
0f4062f4-cde1-4a4e-83e4-2be22f02368b	admin@saleshub.com	Admin	User	$2a$12$/YkRRFmkRJ6yqARRO41wkOVSlse6NUQR2kndJWSp.N.m6kvLmlHWG	\N	t	db4d49fe-3883-4104-85d3-bd165b4028a7	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 13:11:19.374737+00	2025-08-14 13:11:19.374737+00	\N	\N
b202f2a9-13fe-41f1-be43-df14aa2001e0	test@example.com	Test	User	$2a$12$GQ1YAA72/zTckyJlfCMjh.I/5xRuuR9Kf331fuqO2f21/2kAsoMNK	\N	t	db4d49fe-3883-4104-85d3-bd165b4028a7	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-16 13:57:22.307178+00	2025-08-16 13:57:22.307178+00	\N	\N
8b531e80-6526-4d0c-93ce-db70cc2366ea	ted@vib3cod3r.com	Theodore	Tse	$2a$12$LpNkPC1oolJyLsWvXQVIAe8lIuVIPLCNB4Az9qH2g55O640meJANO	\N	t	db4d49fe-3883-4104-85d3-bd165b4028a7	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:44:51.766633+00	2025-08-17 14:44:51.766633+00	\N	\N
ba774a5b-22b2-4766-b985-97548b2380dc	admin@example.com	Admin	User	$2a$12$iK/YfzL2hte15npzrQbDR.qx2U4aAFXqXZr.Frw39P292EdJn7h/6	\N	t	db4d49fe-3883-4104-85d3-bd165b4028a7	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:35:12.093979+00	2025-08-17 16:35:12.093979+00	\N	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: address_types address_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address_types
    ADD CONSTRAINT address_types_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: calls calls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_pkey PRIMARY KEY (id);


--
-- Name: communication_attachments communication_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communication_attachments
    ADD CONSTRAINT communication_attachments_pkey PRIMARY KEY (id);


--
-- Name: communication_types communication_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communication_types
    ADD CONSTRAINT communication_types_pkey PRIMARY KEY (id);


--
-- Name: communications communications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT communications_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_sizes company_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_sizes
    ADD CONSTRAINT company_sizes_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: custom_field_definitions custom_field_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_definitions
    ADD CONSTRAINT custom_field_definitions_pkey PRIMARY KEY (id);


--
-- Name: custom_field_definitions custom_field_definitions_tenant_id_entity_type_field_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_definitions
    ADD CONSTRAINT custom_field_definitions_tenant_id_entity_type_field_name_key UNIQUE (tenant_id, entity_type, field_name);


--
-- Name: custom_field_values custom_field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT custom_field_values_pkey PRIMARY KEY (id);


--
-- Name: custom_fields custom_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_fields
    ADD CONSTRAINT custom_fields_pkey PRIMARY KEY (id);


--
-- Name: custom_objects custom_objects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_objects
    ADD CONSTRAINT custom_objects_pkey PRIMARY KEY (id);


--
-- Name: deal_stage_history deal_stage_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deal_stage_history
    ADD CONSTRAINT deal_stage_history_pkey PRIMARY KEY (id);


--
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- Name: email_address_types email_address_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_address_types
    ADD CONSTRAINT email_address_types_pkey PRIMARY KEY (id);


--
-- Name: email_addresses email_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_addresses
    ADD CONSTRAINT email_addresses_pkey PRIMARY KEY (id);


--
-- Name: industries industries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_pkey PRIMARY KEY (id);


--
-- Name: lead_statuses lead_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_statuses
    ADD CONSTRAINT lead_statuses_pkey PRIMARY KEY (id);


--
-- Name: lead_temperatures lead_temperatures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_temperatures
    ADD CONSTRAINT lead_temperatures_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: marketing_asset_types marketing_asset_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_asset_types
    ADD CONSTRAINT marketing_asset_types_pkey PRIMARY KEY (id);


--
-- Name: marketing_assets marketing_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_assets
    ADD CONSTRAINT marketing_assets_pkey PRIMARY KEY (id);


--
-- Name: marketing_source_types marketing_source_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_source_types
    ADD CONSTRAINT marketing_source_types_pkey PRIMARY KEY (id);


--
-- Name: marketing_sources marketing_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sources
    ADD CONSTRAINT marketing_sources_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: phone_number_types phone_number_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_number_types
    ADD CONSTRAINT phone_number_types_pkey PRIMARY KEY (id);


--
-- Name: phone_numbers phone_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT phone_numbers_pkey PRIMARY KEY (id);


--
-- Name: pipelines pipelines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_pkey PRIMARY KEY (id);


--
-- Name: social_media_accounts social_media_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_accounts
    ADD CONSTRAINT social_media_accounts_pkey PRIMARY KEY (id);


--
-- Name: social_media_types social_media_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_types
    ADD CONSTRAINT social_media_types_pkey PRIMARY KEY (id);


--
-- Name: stages stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT stages_pkey PRIMARY KEY (id);


--
-- Name: task_types task_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_types
    ADD CONSTRAINT task_types_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: territories territories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territories
    ADD CONSTRAINT territories_pkey PRIMARY KEY (id);


--
-- Name: territory_types territory_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territory_types
    ADD CONSTRAINT territory_types_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_territories user_territories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_territories
    ADD CONSTRAINT user_territories_pkey PRIMARY KEY (territory_id, user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_address_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_address_types_code ON public.address_types USING btree (code);


--
-- Name: idx_address_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_address_types_deleted_at ON public.address_types USING btree (deleted_at);


--
-- Name: idx_addresses_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_addresses_deleted_at ON public.addresses USING btree (deleted_at);


--
-- Name: idx_communication_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_communication_types_code ON public.communication_types USING btree (code);


--
-- Name: idx_communication_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_communication_types_deleted_at ON public.communication_types USING btree (deleted_at);


--
-- Name: idx_communications_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_communications_deleted_at ON public.communications USING btree (deleted_at);


--
-- Name: idx_companies_annual_revenue; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_annual_revenue ON public.companies USING btree (annual_revenue);


--
-- Name: idx_companies_assigned_to; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_assigned_to ON public.companies USING btree (assigned_to);


--
-- Name: idx_companies_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_deleted_at ON public.companies USING btree (deleted_at);


--
-- Name: idx_companies_employee_count; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_employee_count ON public.companies USING btree (employee_count);


--
-- Name: idx_companies_industry_sector; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_industry_sector ON public.companies USING btree (industry_sector);


--
-- Name: idx_companies_last_contact_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_last_contact_date ON public.companies USING btree (last_contact_date);


--
-- Name: idx_companies_lead_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_lead_score ON public.companies USING btree (lead_score);


--
-- Name: idx_companies_next_follow_up_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_next_follow_up_date ON public.companies USING btree (next_follow_up_date);


--
-- Name: idx_companies_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_priority ON public.companies USING btree (priority);


--
-- Name: idx_companies_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_status ON public.companies USING btree (status);


--
-- Name: idx_companies_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_tenant ON public.companies USING btree (tenant_id);


--
-- Name: idx_company_sizes_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_company_sizes_code ON public.company_sizes USING btree (code);


--
-- Name: idx_company_sizes_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_sizes_deleted_at ON public.company_sizes USING btree (deleted_at);


--
-- Name: idx_contacts_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_deleted_at ON public.contacts USING btree (deleted_at);


--
-- Name: idx_custom_field_definitions_tenant_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_field_definitions_tenant_entity ON public.custom_field_definitions USING btree (tenant_id, entity_type);


--
-- Name: idx_custom_field_values_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_field_values_entity ON public.custom_field_values USING btree (entity_id, entity_type);


--
-- Name: idx_custom_fields_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_fields_deleted_at ON public.custom_fields USING btree (deleted_at);


--
-- Name: idx_custom_objects_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_objects_deleted_at ON public.custom_objects USING btree (deleted_at);


--
-- Name: idx_deals_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_deleted_at ON public.deals USING btree (deleted_at);


--
-- Name: idx_email_address_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_email_address_types_code ON public.email_address_types USING btree (code);


--
-- Name: idx_email_address_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_address_types_deleted_at ON public.email_address_types USING btree (deleted_at);


--
-- Name: idx_email_addresses_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_addresses_deleted_at ON public.email_addresses USING btree (deleted_at);


--
-- Name: idx_email_addresses_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_addresses_entity ON public.email_addresses USING btree (entity_id, entity_type);


--
-- Name: idx_industries_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_industries_code ON public.industries USING btree (code);


--
-- Name: idx_industries_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_industries_deleted_at ON public.industries USING btree (deleted_at);


--
-- Name: idx_lead_statuses_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_lead_statuses_code ON public.lead_statuses USING btree (code);


--
-- Name: idx_lead_statuses_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lead_statuses_deleted_at ON public.lead_statuses USING btree (deleted_at);


--
-- Name: idx_lead_temperatures_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_lead_temperatures_code ON public.lead_temperatures USING btree (code);


--
-- Name: idx_lead_temperatures_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lead_temperatures_deleted_at ON public.lead_temperatures USING btree (deleted_at);


--
-- Name: idx_leads_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leads_deleted_at ON public.leads USING btree (deleted_at);


--
-- Name: idx_marketing_asset_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_marketing_asset_types_code ON public.marketing_asset_types USING btree (code);


--
-- Name: idx_marketing_asset_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_asset_types_deleted_at ON public.marketing_asset_types USING btree (deleted_at);


--
-- Name: idx_marketing_assets_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_assets_deleted_at ON public.marketing_assets USING btree (deleted_at);


--
-- Name: idx_marketing_source_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_marketing_source_types_code ON public.marketing_source_types USING btree (code);


--
-- Name: idx_marketing_source_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_source_types_deleted_at ON public.marketing_source_types USING btree (deleted_at);


--
-- Name: idx_marketing_sources_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_sources_deleted_at ON public.marketing_sources USING btree (deleted_at);


--
-- Name: idx_phone_number_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_phone_number_types_code ON public.phone_number_types USING btree (code);


--
-- Name: idx_phone_number_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_phone_number_types_deleted_at ON public.phone_number_types USING btree (deleted_at);


--
-- Name: idx_phone_numbers_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_phone_numbers_deleted_at ON public.phone_numbers USING btree (deleted_at);


--
-- Name: idx_phone_numbers_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_phone_numbers_entity ON public.phone_numbers USING btree (entity_id, entity_type);


--
-- Name: idx_pipelines_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pipelines_deleted_at ON public.pipelines USING btree (deleted_at);


--
-- Name: idx_social_media_accounts_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_media_accounts_deleted_at ON public.social_media_accounts USING btree (deleted_at);


--
-- Name: idx_social_media_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_social_media_types_code ON public.social_media_types USING btree (code);


--
-- Name: idx_social_media_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_media_types_deleted_at ON public.social_media_types USING btree (deleted_at);


--
-- Name: idx_task_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_task_types_code ON public.task_types USING btree (code);


--
-- Name: idx_task_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_task_types_deleted_at ON public.task_types USING btree (deleted_at);


--
-- Name: idx_tasks_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_deleted_at ON public.tasks USING btree (deleted_at);


--
-- Name: idx_tenants_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_deleted_at ON public.tenants USING btree (deleted_at);


--
-- Name: idx_tenants_subdomain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_tenants_subdomain ON public.tenants USING btree (subdomain);


--
-- Name: idx_territories_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_territories_deleted_at ON public.territories USING btree (deleted_at);


--
-- Name: idx_territory_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_territory_types_code ON public.territory_types USING btree (code);


--
-- Name: idx_territory_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_territory_types_deleted_at ON public.territory_types USING btree (deleted_at);


--
-- Name: idx_user_roles_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_user_roles_code ON public.user_roles USING btree (code);


--
-- Name: idx_user_roles_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_roles_deleted_at ON public.user_roles USING btree (deleted_at);


--
-- Name: idx_users_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: companies companies_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: companies companies_parent_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_parent_company_id_fkey FOREIGN KEY (parent_company_id) REFERENCES public.companies(id);


--
-- Name: addresses fk_address_types_addresses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT fk_address_types_addresses FOREIGN KEY (type_id) REFERENCES public.address_types(id);


--
-- Name: communications fk_communication_types_communications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_communication_types_communications FOREIGN KEY (type_id) REFERENCES public.communication_types(id);


--
-- Name: communication_attachments fk_communications_attachments; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communication_attachments
    ADD CONSTRAINT fk_communications_attachments FOREIGN KEY (communication_id) REFERENCES public.communications(id);


--
-- Name: custom_field_values fk_communications_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_communications_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.communications(id) ON DELETE CASCADE;


--
-- Name: communications fk_communications_tenant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_communications_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: activity_logs fk_companies_activity_logs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_companies_activity_logs FOREIGN KEY (entity_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: contacts fk_companies_contacts; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT fk_companies_contacts FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: custom_field_values fk_companies_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_companies_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: deals fk_companies_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_companies_deals FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: leads fk_companies_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_companies_leads FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: companies fk_company_sizes_companies; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT fk_company_sizes_companies FOREIGN KEY (size_id) REFERENCES public.company_sizes(id);


--
-- Name: activity_logs fk_contacts_activity_logs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_contacts_activity_logs FOREIGN KEY (entity_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: addresses fk_contacts_addresses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT fk_contacts_addresses FOREIGN KEY (entity_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: communications fk_contacts_communications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_contacts_communications FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: custom_field_values fk_contacts_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_contacts_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: deals fk_contacts_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_contacts_deals FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: leads fk_contacts_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_contacts_leads FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: social_media_accounts fk_contacts_social_media_accounts; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_accounts
    ADD CONSTRAINT fk_contacts_social_media_accounts FOREIGN KEY (entity_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: custom_field_values fk_custom_fields_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_custom_fields_values FOREIGN KEY (field_id) REFERENCES public.custom_fields(id);


--
-- Name: deal_stage_history fk_deal_stage_history_from_stage; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deal_stage_history
    ADD CONSTRAINT fk_deal_stage_history_from_stage FOREIGN KEY (from_stage_id) REFERENCES public.stages(id);


--
-- Name: activity_logs fk_deals_activity_logs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_deals_activity_logs FOREIGN KEY (entity_id) REFERENCES public.deals(id) ON DELETE CASCADE;


--
-- Name: communications fk_deals_communications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_deals_communications FOREIGN KEY (deal_id) REFERENCES public.deals(id);


--
-- Name: custom_field_values fk_deals_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_deals_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.deals(id) ON DELETE CASCADE;


--
-- Name: deal_stage_history fk_deals_stage_history; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deal_stage_history
    ADD CONSTRAINT fk_deals_stage_history FOREIGN KEY (deal_id) REFERENCES public.deals(id);


--
-- Name: tasks fk_deals_tasks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_deals_tasks FOREIGN KEY (deal_id) REFERENCES public.deals(id);


--
-- Name: email_addresses fk_email_address_types_email_addresses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_addresses
    ADD CONSTRAINT fk_email_address_types_email_addresses FOREIGN KEY (type_id) REFERENCES public.email_address_types(id);


--
-- Name: companies fk_industries_companies; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT fk_industries_companies FOREIGN KEY (industry_id) REFERENCES public.industries(id);


--
-- Name: leads fk_lead_statuses_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_lead_statuses_leads FOREIGN KEY (status_id) REFERENCES public.lead_statuses(id);


--
-- Name: leads fk_lead_temperatures_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_lead_temperatures_leads FOREIGN KEY (temperature_id) REFERENCES public.lead_temperatures(id);


--
-- Name: activity_logs fk_leads_activity_logs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_leads_activity_logs FOREIGN KEY (entity_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: communications fk_leads_communications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_leads_communications FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: custom_field_values fk_leads_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_leads_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: tasks fk_leads_tasks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_leads_tasks FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: marketing_assets fk_marketing_asset_types_marketing_assets; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_assets
    ADD CONSTRAINT fk_marketing_asset_types_marketing_assets FOREIGN KEY (type_id) REFERENCES public.marketing_asset_types(id);


--
-- Name: custom_field_values fk_marketing_assets_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_marketing_assets_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.marketing_assets(id) ON DELETE CASCADE;


--
-- Name: marketing_sources fk_marketing_source_types_marketing_sources; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sources
    ADD CONSTRAINT fk_marketing_source_types_marketing_sources FOREIGN KEY (type_id) REFERENCES public.marketing_source_types(id);


--
-- Name: custom_field_values fk_marketing_sources_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_marketing_sources_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.marketing_sources(id) ON DELETE CASCADE;


--
-- Name: leads fk_marketing_sources_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_marketing_sources_leads FOREIGN KEY (marketing_source_id) REFERENCES public.marketing_sources(id);


--
-- Name: phone_numbers fk_phone_number_types_phone_numbers; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT fk_phone_number_types_phone_numbers FOREIGN KEY (type_id) REFERENCES public.phone_number_types(id);


--
-- Name: deals fk_pipelines_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_pipelines_deals FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id);


--
-- Name: stages fk_pipelines_stages; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT fk_pipelines_stages FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id);


--
-- Name: social_media_accounts fk_social_media_types_social_media_accounts; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_accounts
    ADD CONSTRAINT fk_social_media_types_social_media_accounts FOREIGN KEY (type_id) REFERENCES public.social_media_types(id);


--
-- Name: deals fk_stages_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_stages_deals FOREIGN KEY (stage_id) REFERENCES public.stages(id);


--
-- Name: deal_stage_history fk_stages_stage_history; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deal_stage_history
    ADD CONSTRAINT fk_stages_stage_history FOREIGN KEY (to_stage_id) REFERENCES public.stages(id);


--
-- Name: tasks fk_task_types_tasks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_task_types_tasks FOREIGN KEY (type_id) REFERENCES public.task_types(id);


--
-- Name: users fk_tasks_created_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_tasks_created_by_user FOREIGN KEY (created_by) REFERENCES public.tasks(id);


--
-- Name: custom_field_values fk_tasks_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_tasks_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks fk_tasks_tenant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_tasks_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: address_types fk_tenants_address_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address_types
    ADD CONSTRAINT fk_tenants_address_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: addresses fk_tenants_addresses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT fk_tenants_addresses FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: communication_types fk_tenants_communication_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communication_types
    ADD CONSTRAINT fk_tenants_communication_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: companies fk_tenants_companies; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT fk_tenants_companies FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: company_sizes fk_tenants_company_sizes; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_sizes
    ADD CONSTRAINT fk_tenants_company_sizes FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: contacts fk_tenants_contacts; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT fk_tenants_contacts FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: custom_fields fk_tenants_custom_fields; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_fields
    ADD CONSTRAINT fk_tenants_custom_fields FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: custom_objects fk_tenants_custom_objects; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_objects
    ADD CONSTRAINT fk_tenants_custom_objects FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: deals fk_tenants_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_tenants_deals FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: email_address_types fk_tenants_email_address_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_address_types
    ADD CONSTRAINT fk_tenants_email_address_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: email_addresses fk_tenants_email_addresses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_addresses
    ADD CONSTRAINT fk_tenants_email_addresses FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: industries fk_tenants_industries; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT fk_tenants_industries FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: lead_statuses fk_tenants_lead_statuses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_statuses
    ADD CONSTRAINT fk_tenants_lead_statuses FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: lead_temperatures fk_tenants_lead_temperatures; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_temperatures
    ADD CONSTRAINT fk_tenants_lead_temperatures FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: leads fk_tenants_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_tenants_leads FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: marketing_asset_types fk_tenants_marketing_asset_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_asset_types
    ADD CONSTRAINT fk_tenants_marketing_asset_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: marketing_assets fk_tenants_marketing_assets; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_assets
    ADD CONSTRAINT fk_tenants_marketing_assets FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: marketing_source_types fk_tenants_marketing_source_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_source_types
    ADD CONSTRAINT fk_tenants_marketing_source_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: marketing_sources fk_tenants_marketing_sources; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sources
    ADD CONSTRAINT fk_tenants_marketing_sources FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: phone_number_types fk_tenants_phone_number_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_number_types
    ADD CONSTRAINT fk_tenants_phone_number_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: phone_numbers fk_tenants_phone_numbers; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT fk_tenants_phone_numbers FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: pipelines fk_tenants_pipelines; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT fk_tenants_pipelines FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: social_media_accounts fk_tenants_social_media_accounts; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_accounts
    ADD CONSTRAINT fk_tenants_social_media_accounts FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: social_media_types fk_tenants_social_media_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_types
    ADD CONSTRAINT fk_tenants_social_media_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: stages fk_tenants_stages; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT fk_tenants_stages FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: task_types fk_tenants_task_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_types
    ADD CONSTRAINT fk_tenants_task_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: territories fk_tenants_territories; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territories
    ADD CONSTRAINT fk_tenants_territories FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: territory_types fk_tenants_territory_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territory_types
    ADD CONSTRAINT fk_tenants_territory_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: user_roles fk_tenants_user_roles; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_tenants_user_roles FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: users fk_tenants_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_tenants_users FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: territories fk_territory_types_territories; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territories
    ADD CONSTRAINT fk_territory_types_territories FOREIGN KEY (type_id) REFERENCES public.territory_types(id);


--
-- Name: users fk_user_roles_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_user_roles_users FOREIGN KEY (role_id) REFERENCES public.user_roles(id);


--
-- Name: user_territories fk_user_territories_territory; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_territories
    ADD CONSTRAINT fk_user_territories_territory FOREIGN KEY (territory_id) REFERENCES public.territories(id);


--
-- Name: user_territories fk_user_territories_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_territories
    ADD CONSTRAINT fk_user_territories_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: activity_logs fk_users_activity_logs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_users_activity_logs FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: deals fk_users_assigned_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_users_assigned_deals FOREIGN KEY (assigned_user_id) REFERENCES public.users(id);


--
-- Name: leads fk_users_assigned_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_users_assigned_leads FOREIGN KEY (assigned_user_id) REFERENCES public.users(id);


--
-- Name: tasks fk_users_assigned_tasks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_users_assigned_tasks FOREIGN KEY (assigned_user_id) REFERENCES public.users(id);


--
-- Name: communications fk_users_communications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_users_communications FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: tasks fk_users_created_tasks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_users_created_tasks FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.user_roles(id);


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- PostgreSQL database dump complete
--

