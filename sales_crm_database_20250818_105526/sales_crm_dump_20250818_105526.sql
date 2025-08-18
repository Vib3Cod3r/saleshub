--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 16.9

-- Started on 2025-08-18 10:55:26 HKT

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

DROP DATABASE IF EXISTS sales_crm;
--
-- TOC entry 3973 (class 1262 OID 16384)
-- Name: sales_crm; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE sales_crm WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';


ALTER DATABASE sales_crm OWNER TO postgres;

\connect sales_crm

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
-- TOC entry 915 (class 1247 OID 16538)
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
-- TOC entry 891 (class 1247 OID 16444)
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
-- TOC entry 909 (class 1247 OID 16520)
-- Name: Direction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Direction" AS ENUM (
    'INBOUND',
    'OUTBOUND'
);


ALTER TYPE public."Direction" OWNER TO postgres;

--
-- TOC entry 888 (class 1247 OID 16428)
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
-- TOC entry 885 (class 1247 OID 16410)
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
-- TOC entry 912 (class 1247 OID 16526)
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
-- TOC entry 906 (class 1247 OID 16508)
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
-- TOC entry 903 (class 1247 OID 16494)
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
-- TOC entry 897 (class 1247 OID 16474)
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
-- TOC entry 900 (class 1247 OID 16484)
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
-- TOC entry 894 (class 1247 OID 16458)
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
-- TOC entry 882 (class 1247 OID 16402)
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
-- TOC entry 214 (class 1259 OID 16387)
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
-- TOC entry 218 (class 1259 OID 16649)
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
-- TOC entry 256 (class 1259 OID 17690)
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
-- TOC entry 237 (class 1259 OID 17081)
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
-- TOC entry 251 (class 1259 OID 17527)
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
-- TOC entry 3974 (class 0 OID 0)
-- Dependencies: 251
-- Name: TABLE addresses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.addresses IS 'Polymorphic table for addresses. EntityID references different tables based on EntityType.';


--
-- TOC entry 215 (class 1259 OID 16621)
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
-- TOC entry 248 (class 1259 OID 17433)
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
-- TOC entry 233 (class 1259 OID 17017)
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
-- TOC entry 247 (class 1259 OID 17394)
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
-- TOC entry 226 (class 1259 OID 16819)
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
    deleted_at timestamp with time zone
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16751)
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
-- TOC entry 229 (class 1259 OID 16876)
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
-- TOC entry 254 (class 1259 OID 17623)
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
-- TOC entry 253 (class 1259 OID 17607)
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
-- TOC entry 255 (class 1259 OID 17676)
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
-- TOC entry 245 (class 1259 OID 17349)
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
-- TOC entry 240 (class 1259 OID 17162)
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
-- TOC entry 236 (class 1259 OID 17065)
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
-- TOC entry 250 (class 1259 OID 17486)
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
    deleted_at timestamp with time zone
);


ALTER TABLE public.email_addresses OWNER TO postgres;

--
-- TOC entry 3975 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE email_addresses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.email_addresses IS 'Polymorphic table for email addresses. EntityID references different tables based on EntityType.';


--
-- TOC entry 223 (class 1259 OID 16735)
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
-- TOC entry 227 (class 1259 OID 16843)
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
-- TOC entry 228 (class 1259 OID 16860)
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
-- TOC entry 241 (class 1259 OID 17203)
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
-- TOC entry 232 (class 1259 OID 17001)
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
-- TOC entry 246 (class 1259 OID 17372)
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
-- TOC entry 230 (class 1259 OID 16898)
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
-- TOC entry 231 (class 1259 OID 16914)
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
-- TOC entry 217 (class 1259 OID 16638)
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
-- TOC entry 216 (class 1259 OID 16629)
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
-- TOC entry 235 (class 1259 OID 17049)
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
-- TOC entry 249 (class 1259 OID 17446)
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
    deleted_at timestamp with time zone
);


ALTER TABLE public.phone_numbers OWNER TO postgres;

--
-- TOC entry 3976 (class 0 OID 0)
-- Dependencies: 249
-- Name: TABLE phone_numbers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.phone_numbers IS 'Polymorphic table for phone numbers. EntityID references different tables based on EntityType.';


--
-- TOC entry 221 (class 1259 OID 16699)
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
-- TOC entry 252 (class 1259 OID 17567)
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
-- TOC entry 3977 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE social_media_accounts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.social_media_accounts IS 'Polymorphic table for social media accounts. EntityID references different tables based on EntityType.';


--
-- TOC entry 238 (class 1259 OID 17097)
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
-- TOC entry 222 (class 1259 OID 16714)
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
-- TOC entry 225 (class 1259 OID 16791)
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
-- TOC entry 242 (class 1259 OID 17248)
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
-- TOC entry 219 (class 1259 OID 16671)
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
-- TOC entry 243 (class 1259 OID 17313)
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
-- TOC entry 234 (class 1259 OID 17033)
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
-- TOC entry 220 (class 1259 OID 16682)
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
-- TOC entry 244 (class 1259 OID 17332)
-- Name: user_territories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_territories (
    territory_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.user_territories OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17139)
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
-- TOC entry 3925 (class 0 OID 16387)
-- Dependencies: 214
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- TOC entry 3929 (class 0 OID 16649)
-- Dependencies: 218
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, type, title, description, metadata, "createdAt", "userId") FROM stdin;
\.


--
-- TOC entry 3967 (class 0 OID 17690)
-- Dependencies: 256
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, entity_type, entity_id, action, field_name, old_value, new_value, user_id, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- TOC entry 3948 (class 0 OID 17081)
-- Dependencies: 237
-- Data for Name: address_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.address_types (id, name, code, description, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
d931297e-8f4e-42bf-881b-3362c4f35754	Home	HOME	Home address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.475506+00	2025-08-15 08:15:49.475506+00	\N
575555b6-e01a-4991-a6ba-a88e5da3d3d5	Work	WORK	Work address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.478841+00	2025-08-15 08:15:49.478841+00	\N
d0991f00-e41f-41b0-a291-8132fd10384c	Billing	BILLING	Billing address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.481274+00	2025-08-15 08:15:49.481274+00	\N
7f54a2a0-b109-4a19-b501-f4f536f531ad	Shipping	SHIPPING	Shipping address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.483469+00	2025-08-15 08:15:49.483469+00	\N
\.


--
-- TOC entry 3962 (class 0 OID 17527)
-- Dependencies: 251
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, street1, street2, city, state, postal_code, country, is_primary, type_id, entity_id, entity_type, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
b008710e-745e-443f-a0aa-a5c6e4a24123	888 5th Ave	\N	Colorado Springs	MS	25567	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	b9f04d97-3de9-4904-abfc-02da289b36c3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.584754+00	2025-08-17 16:27:08.584754+00	\N
fee06e16-92c2-41b1-8fc1-42355568cadf	987 Maple Dr	\N	Colorado Springs	AL	14593	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	f3b9674b-6d74-44fc-8e45-d211e690bbbe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.665082+00	2025-08-17 16:27:08.665082+00	\N
14879979-2b59-46ac-b03e-3f29a2b4b422	333 Washington Blvd	\N	Memphis	IL	73191	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	cb7bd4d2-dd4f-4f3e-ac59-0a62a347c699	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.689737+00	2025-08-17 16:27:08.689737+00	\N
28f1a480-b138-4cac-99a9-976d06e7e99b	333 5th Ave	\N	Charlotte	PA	11066	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	4ca5e3bb-818b-4ea2-bdc4-302ba84030dd	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.893178+00	2025-08-17 16:27:08.893178+00	\N
cc1d0e11-c079-41ed-9140-48af381024d0	321 Park Ave	\N	Albuquerque	WV	34178	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	29785965-f1d8-404b-b676-66eb57674d18	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.912023+00	2025-08-17 16:27:08.912023+00	\N
b1139bba-1d08-4635-bab0-98665fe2c7b6	111 Oak Ave	Suite 942	Charlotte	UT	48538	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	29785965-f1d8-404b-b676-66eb57674d18	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.914043+00	2025-08-17 16:27:08.914043+00	\N
9e065f61-ef37-4434-9469-d130e0294c1d	666 Oak Ave	\N	Colorado Springs	NY	26360	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	1c682b6d-deb0-4f45-b6f5-7fa15e022d6a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.928206+00	2025-08-17 16:27:08.928206+00	\N
dae78a87-eed1-4345-83ca-6cf6732e51a5	789 5th Ave	Suite 555	Milwaukee	IA	18662	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	1c682b6d-deb0-4f45-b6f5-7fa15e022d6a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.930283+00	2025-08-17 16:27:08.930283+00	\N
6c03c502-e22d-4edb-875e-1699e89081a2	654 Park Place	\N	Chicago	MS	11337	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	d8447d3f-b609-4082-8465-a011f51df931	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.941054+00	2025-08-17 16:27:08.941054+00	\N
907f50f1-2788-4fc7-ae2c-697474041386	999 Pine Rd	Suite 731	New York	IN	11691	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	d8447d3f-b609-4082-8465-a011f51df931	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.943287+00	2025-08-17 16:27:08.943287+00	\N
3e8a2121-dcd5-4a74-bed2-de91390edbb9	777 Elm St	\N	New Orleans	MI	13787	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	930ee9a5-7dc6-4c0e-aaa2-2ff6e58600a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.962058+00	2025-08-17 16:27:08.962058+00	\N
54d82584-0df6-4c92-904b-c08373e29dbd	888 Central Ave	\N	Columbus	PA	48712	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	f980c170-c4ff-43bc-8a6e-1ffccdfc71e7	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.976715+00	2025-08-17 16:27:08.976715+00	\N
5a471e6c-81c0-445b-9f22-dbe4cb6347bf	222 Oak Ave	Suite 200	Columbus	SC	79432	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	f980c170-c4ff-43bc-8a6e-1ffccdfc71e7	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.980165+00	2025-08-17 16:27:08.980165+00	\N
2db89e64-4f47-43e5-83ca-0bdfac51a76b	888 Maple Dr	\N	Portland	NJ	74599	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	26a14cfc-424f-42fc-98b0-ca7ddc12563b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.004451+00	2025-08-17 16:27:09.004451+00	\N
d70963a0-c977-4aa3-9332-4ae85babf40b	111 Park Place	\N	Washington	WV	99440	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	34e3d58a-7972-48bc-9763-70f81fff7047	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.023099+00	2025-08-17 16:27:09.023099+00	\N
b18eb604-d0b6-4d38-8c4b-bdeabcb6a531	987 Pine Rd	\N	Memphis	CA	38251	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	3931d0ed-21f3-4c42-9c46-9d109fb49efe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.036907+00	2025-08-17 16:27:09.036907+00	\N
9a50ca24-e5af-4a27-9aab-7132c0e6d4e9	777 Park Ave	Suite 496	Austin	CT	22087	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	3931d0ed-21f3-4c42-9c46-9d109fb49efe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.038775+00	2025-08-17 16:27:09.038775+00	\N
8bac2ad1-d2af-458a-bc1a-508e9a8faea6	666 Central Ave	\N	Las Vegas	SD	34931	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	222a3bcf-c11d-4357-af01-e73a23bfe2fb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.054467+00	2025-08-17 16:27:09.054467+00	\N
c3740805-1720-4d8b-b65a-279be8538781	888 Oak Ave	Suite 991	Austin	PA	24932	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	222a3bcf-c11d-4357-af01-e73a23bfe2fb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.056521+00	2025-08-17 16:27:09.056521+00	\N
81db97f4-7fbc-4998-a726-99fc341b2f02	999 Elm St	\N	Raleigh	AZ	51330	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	ba177b04-db10-4ecf-ac88-5420d22d6a24	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.073709+00	2025-08-17 16:27:09.073709+00	\N
bcb8010d-9061-47ec-afac-0f478d583a80	654 Lexington Ave	Suite 970	Columbus	WY	46579	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	ba177b04-db10-4ecf-ac88-5420d22d6a24	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.075667+00	2025-08-17 16:27:09.075667+00	\N
413c07f8-cc2d-49f9-9e8c-1ce28787f7c7	321 Elm St	\N	Miami	SD	89207	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	aa802da1-5d54-4fae-a6e5-b34cf705cbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.092426+00	2025-08-17 16:27:09.092426+00	\N
8fa0ddb3-b545-4bc7-8b94-748a3e435583	555 Elm St	\N	Omaha	AL	93920	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	85eae53c-da16-4325-af27-990fa897ef7c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.108998+00	2025-08-17 16:27:09.108998+00	\N
6ce3002e-499b-4d8d-aa02-c56944e56fc1	333 Main St	\N	Oklahoma City	UT	12516	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	5eb898e5-99f9-4347-b46f-5856733e4b9c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.124531+00	2025-08-17 16:27:09.124531+00	\N
01ac16c5-432e-43cf-9c95-a2d7b8115414	444 Pine Rd	\N	Wichita	AL	14173	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	dccfe585-17f2-48de-bdb4-5cf2854f339a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.13863+00	2025-08-17 16:27:09.13863+00	\N
aadad4b8-8ecc-408d-93e0-8fadb751f78d	456 Pine Rd	\N	Milwaukee	TN	54406	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	951e604b-e969-4eca-8a13-c809f9c33ea9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.147962+00	2025-08-17 16:27:09.147962+00	\N
ce2e5f48-40ab-486f-8243-8feea0f9e377	888 Maple Dr	\N	Long Beach	PA	11191	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	1b3a6439-679b-4f20-8346-976b28e5b77c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.163735+00	2025-08-17 16:27:09.163735+00	\N
740df930-a086-4ba4-95dc-b01e426b923a	888 Pine Rd	\N	Los Angeles	SC	65413	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	0e896c9c-119e-46c2-8abd-fb981c795ce5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.179604+00	2025-08-17 16:27:09.179604+00	\N
3d7330e9-a508-4424-bb66-f61a40a46d14	777 Maple Dr	Suite 425	El Paso	WA	52845	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	0e896c9c-119e-46c2-8abd-fb981c795ce5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.181842+00	2025-08-17 16:27:09.181842+00	\N
725ffa4b-0195-4fba-ad6a-a7c4889c434b	987 Broadway	\N	El Paso	MT	62858	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	f824d895-18f5-4344-9ff7-bfb76ab6df98	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.195036+00	2025-08-17 16:27:09.195036+00	\N
4a54f518-69fb-4a9f-a08c-dc7f910cc81d	123 Madison Ave	\N	Long Beach	FL	65649	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	6420c0a8-291d-4c42-b228-89764cde3686	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.211751+00	2025-08-17 16:27:09.211751+00	\N
2dae9d62-38fd-4175-b9dc-f2dd0b807915	654 Oak Ave	Suite 770	Virginia Beach	ID	54612	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	6420c0a8-291d-4c42-b228-89764cde3686	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.214659+00	2025-08-17 16:27:09.214659+00	\N
1d752159-61e4-4086-8184-155bf6007677	999 Park Ave	\N	Omaha	CA	11679	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	c0f35d3a-9c2d-4f7b-a6bb-1f92c55c415c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.224416+00	2025-08-17 16:27:09.224416+00	\N
b280c39f-fcd8-4df2-8018-592031bded98	654 Madison Ave	Suite 930	Portland	PA	68332	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	c0f35d3a-9c2d-4f7b-a6bb-1f92c55c415c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.226989+00	2025-08-17 16:27:09.226989+00	\N
5796377c-7dab-457e-839c-206a9db1c2d8	789 Central Ave	\N	Atlanta	NH	96773	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	6e859df2-22d8-41b6-99d4-dfceab790528	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.24361+00	2025-08-17 16:27:09.24361+00	\N
85110eb3-3c04-4494-95a1-ac468ca42687	789 Main St	Suite 1081	Philadelphia	TX	26825	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	6e859df2-22d8-41b6-99d4-dfceab790528	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.245992+00	2025-08-17 16:27:09.245992+00	\N
4ad131a0-8e1f-4215-bd14-f14223249676	321 Riverside Dr	\N	New Orleans	VA	65342	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	4375098f-16fc-4d28-b962-52c7396818c8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.258358+00	2025-08-17 16:27:09.258358+00	\N
32a8d3fc-0fc1-4ad0-970c-881b24d89ad5	444 Pine Rd	\N	Portland	GA	33991	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	1d1adc78-f37f-4139-8f20-987ee464e4ab	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.274773+00	2025-08-17 16:27:09.274773+00	\N
d1a60707-e2b9-45b1-90a1-3cb4900a54d5	333 Maple Dr	Suite 689	Wichita	AL	78773	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	1d1adc78-f37f-4139-8f20-987ee464e4ab	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.278288+00	2025-08-17 16:27:09.278288+00	\N
ff5b1689-850c-4ed9-b981-16a7461f8375	789 Broadway	\N	San Antonio	MS	61771	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	a188730d-46cd-4d96-bbb3-6cb5f4edcc3e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.294988+00	2025-08-17 16:27:09.294988+00	\N
a4581ad5-5778-4635-b385-89479bee53a4	111 5th Ave	Suite 293	Jacksonville	RI	26807	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	a188730d-46cd-4d96-bbb3-6cb5f4edcc3e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.297169+00	2025-08-17 16:27:09.297169+00	\N
2ea7d308-bc9b-472b-bdc1-69260dda2b85	777 Main St	\N	Fresno	LA	86621	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	fc0b81a6-fa60-4908-8cf3-8de83e8dac14	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.314595+00	2025-08-17 16:27:09.314595+00	\N
94964256-d0b6-4fa5-a1f1-caa53f8006fe	222 Madison Ave	Suite 619	Louisville	OH	87178	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	fc0b81a6-fa60-4908-8cf3-8de83e8dac14	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.316788+00	2025-08-17 16:27:09.316788+00	\N
fab15d6a-5ea0-4ab5-8deb-5a94dc919b5f	123 Main St	\N	New York	TN	79663	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	751ac3d4-abfb-4e44-bb2e-5eb440e1a95c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.329314+00	2025-08-17 16:27:09.329314+00	\N
0d67a752-88ea-4449-a193-80b8433f8f9a	666 Central Ave	Suite 476	Las Vegas	IL	86984	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	751ac3d4-abfb-4e44-bb2e-5eb440e1a95c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.331539+00	2025-08-17 16:27:09.331539+00	\N
5b1fac89-44f5-4bee-add8-efa81dd4a816	789 Washington Blvd	\N	Tulsa	MO	69188	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	8b644611-c702-4925-840e-f9fcb2d7e49e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.347926+00	2025-08-17 16:27:09.347926+00	\N
50631fce-ca1d-45f8-bc77-17170d76ce49	777 Park Place	\N	Las Vegas	AZ	12131	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	a3694834-ba15-417f-bc5f-f0ef8f32829a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.363617+00	2025-08-17 16:27:09.363617+00	\N
308e3776-7f3b-436e-ba3d-af99e9e42d34	111 Park Place	Suite 167	Arlington	NC	50965	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	a3694834-ba15-417f-bc5f-f0ef8f32829a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.366105+00	2025-08-17 16:27:09.366105+00	\N
e96e5001-a196-4e01-9581-c6a3d115c296	777 Maple Dr	\N	Seattle	PA	48393	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	e9b09322-628a-43e7-8c24-47eeb0242ccb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.379216+00	2025-08-17 16:27:09.379216+00	\N
c2595987-ef21-46f1-9734-08e6749fb2e3	654 Riverside Dr	\N	Los Angeles	KY	37934	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	cd55c2c8-ecd2-487e-a1c4-52c280c2bf4c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.072515+00	2025-08-18 02:55:15.072515+00	\N
1c8ab640-9c54-4e62-8265-a340a8682b8a	789 Broadway	Suite 594	Virginia Beach	UT	16724	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	cd55c2c8-ecd2-487e-a1c4-52c280c2bf4c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.075423+00	2025-08-18 02:55:15.075423+00	\N
4cf158d2-89c4-4eb0-86c7-dcbe4c33b031	444 Oak Ave	\N	El Paso	KY	34958	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	2771d43c-c1f9-4bda-9885-f81fea26023c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.088823+00	2025-08-18 02:55:15.088823+00	\N
d6bbd917-35ad-4d79-882a-7ea62bbfb7e9	999 Park Place	Suite 372	Milwaukee	DE	44519	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	2771d43c-c1f9-4bda-9885-f81fea26023c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.09094+00	2025-08-18 02:55:15.09094+00	\N
914d912b-833a-4801-bffc-ecba7cc2e251	111 Central Ave	\N	Charlotte	NY	53970	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	267eb4cd-fd86-40db-9a1a-17692fd0e23c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.107116+00	2025-08-18 02:55:15.107116+00	\N
49dfaa72-f1ee-4b61-acaa-2efa05b0968d	987 Lexington Ave	\N	Fort Worth	AR	36432	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	d461e239-611f-4a1c-a768-81bb4c34a0df	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.12333+00	2025-08-18 02:55:15.12333+00	\N
4ee7dc0d-b628-496f-9f67-08c541360612	444 Elm St	\N	Chicago	DE	70618	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	afc348bd-91d6-4d70-b977-a539027e318a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.134437+00	2025-08-18 02:55:15.134437+00	\N
594762e0-6e07-44a9-b506-de8952664b1c	333 Maple Dr	\N	Washington	VT	79158	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	9b539c21-7c5d-4a8f-a0ec-87fb99dcda53	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.146958+00	2025-08-18 02:55:15.146958+00	\N
eb091154-72fd-4db9-bbcf-512b4d0eb68f	555 Lexington Ave	Suite 742	Kansas City	WI	84063	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	9b539c21-7c5d-4a8f-a0ec-87fb99dcda53	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.148647+00	2025-08-18 02:55:15.148647+00	\N
ed0d9abf-1254-4cd7-97d4-d56e76458fac	111 Washington Blvd	\N	Arlington	WI	96531	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	85431359-6040-491f-89a6-d18c651dda35	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.157878+00	2025-08-18 02:55:15.157878+00	\N
a56a1a0a-06cd-4881-94b1-e6e88d46feac	444 Pine Rd	Suite 410	Charlotte	WI	60697	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	85431359-6040-491f-89a6-d18c651dda35	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.159596+00	2025-08-18 02:55:15.159596+00	\N
8208f301-1c53-4279-b5b6-50510459b277	222 Maple Dr	\N	Tucson	PA	68851	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	ce38cfeb-efc5-4be9-943d-8a7d13054252	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.168538+00	2025-08-18 02:55:15.168538+00	\N
0fb41d8a-57a5-4d67-af1e-d48bc770a268	987 Washington Blvd	Suite 102	San Antonio	OR	95304	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	ce38cfeb-efc5-4be9-943d-8a7d13054252	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.170341+00	2025-08-18 02:55:15.170341+00	\N
80d95265-169a-4519-8923-70b50b653a3c	789 Riverside Dr	\N	Seattle	SC	49544	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	41a1889f-0ce5-44b6-90ae-74f94ae8395f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.18277+00	2025-08-18 02:55:15.18277+00	\N
f0c10269-67b9-49d8-a091-9caad37e8bdd	666 Park Ave	Suite 350	New York	NE	91263	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	41a1889f-0ce5-44b6-90ae-74f94ae8395f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.184566+00	2025-08-18 02:55:15.184566+00	\N
f54728e9-e774-4891-b6ed-da3b7ee2f03d	666 Park Ave	\N	Las Vegas	AL	83556	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	29f657bd-ad62-4ff8-9079-e752adb8fc95	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.199079+00	2025-08-18 02:55:15.199079+00	\N
59bed916-8dd1-44c1-8b41-a93fb9abd8b3	111 Main St	\N	Long Beach	PA	59653	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	9e870dbe-365e-47a7-a95c-0f67dd9cebde	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.211716+00	2025-08-18 02:55:15.211716+00	\N
09b47604-faec-41ba-bced-740653649750	777 Cedar Ln	\N	Charlotte	MT	66573	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	7815fdbc-9c74-42e0-bbce-f38f376245b8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.222462+00	2025-08-18 02:55:15.222462+00	\N
af13a608-ae6b-40c0-9306-59bf1562d10a	333 Maple Dr	\N	Oakland	TX	19398	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	b6a49221-833f-4f0e-9a50-c851993efc85	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.235107+00	2025-08-18 02:55:15.235107+00	\N
25dee4bd-391f-4144-bb57-3a554fc8eda9	555 Main St	\N	Jacksonville	TX	86606	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	908904fb-611c-4d96-ac00-112efaad8b5a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.247514+00	2025-08-18 02:55:15.247514+00	\N
4e912607-5200-4563-9b06-4adc2448bdd6	888 Maple Dr	\N	Miami	SD	27798	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	91fc63e7-940c-4fb1-9c07-c465ac942d49	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.259915+00	2025-08-18 02:55:15.259915+00	\N
c6b446d7-2886-4540-86c1-db7a9b2663b5	999 Pine Rd	\N	Minneapolis	MA	80015	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	8dd1c642-ce9c-4c71-9edb-71cbc4f4fbd4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.270151+00	2025-08-18 02:55:15.270151+00	\N
b011c8ca-a719-4045-87d7-bbd3984575cb	666 Broadway	\N	Fort Worth	MS	75142	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	23391801-1492-42b3-8dbd-547d8543849e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.282463+00	2025-08-18 02:55:15.282463+00	\N
77a3b346-0fe8-41c7-896c-a8b230ba77a7	111 Elm St	Suite 537	San Jose	NV	39907	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	23391801-1492-42b3-8dbd-547d8543849e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.284059+00	2025-08-18 02:55:15.284059+00	\N
1bdbdbec-1919-4222-abbe-4ba76ffd3b64	456 Maple Dr	\N	Indianapolis	TX	19290	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	31ecbbc0-e8e3-40d4-a154-82a3e5d00c26	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.298091+00	2025-08-18 02:55:15.298091+00	\N
1cc17039-e091-4863-8ed1-445a69314561	123 Cedar Ln	\N	Columbus	HI	96215	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	646d6f02-718a-4c53-bbbd-d58eea128eae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.312707+00	2025-08-18 02:55:15.312707+00	\N
1dccb0b2-4bf3-4047-a9a5-fea21b48c948	987 Maple Dr	Suite 408	Washington	WV	65647	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	646d6f02-718a-4c53-bbbd-d58eea128eae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.314377+00	2025-08-18 02:55:15.314377+00	\N
78dc4c8f-21ba-4090-857d-af2fcfe83357	444 Park Ave	\N	Portland	TX	16411	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	121e9087-021e-40b7-940d-67ad17509dfc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.328715+00	2025-08-18 02:55:15.328715+00	\N
2c7d50fc-f9d3-405b-a568-f6441b5a4da0	555 Madison Ave	\N	Miami	WY	75307	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	236a6915-c1e6-4383-84a4-e1beeae48946	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.342546+00	2025-08-18 02:55:15.342546+00	\N
e67627e9-cb9b-42b5-b690-8ba8ee9e01ec	333 Lexington Ave	Suite 616	Raleigh	RI	46008	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	236a6915-c1e6-4383-84a4-e1beeae48946	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.344168+00	2025-08-18 02:55:15.344168+00	\N
5feb3bf6-da25-4eb5-a296-74f26ccf5633	555 Broadway	\N	San Jose	TN	44525	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	37df802c-9567-49cd-ac53-32844bfac8e9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.353696+00	2025-08-18 02:55:15.353696+00	\N
39f2184f-d7cc-4a67-8491-20a4450fc2e5	123 Lexington Ave	Suite 978	New York	IN	95702	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	37df802c-9567-49cd-ac53-32844bfac8e9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.356633+00	2025-08-18 02:55:15.356633+00	\N
02763510-064d-4877-a75e-2dd8bf6881d5	888 Washington Blvd	\N	Boston	NH	42945	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	287bc30a-d62a-4e07-a6f8-c5046d07f99e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.37918+00	2025-08-18 02:55:15.37918+00	\N
564d64c3-1aa3-4c55-a7ed-65235bbcb165	123 Broadway	\N	Miami	ID	54929	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	54c1338c-8fa7-4983-9757-423a70ef6cf5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.417221+00	2025-08-18 02:55:15.417221+00	\N
ca57c80e-810c-4134-b712-477e8c31971b	654 Park Place	\N	Virginia Beach	FL	37441	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	b24ead22-d7df-4e0f-a8f5-79dd1d93f71f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.460096+00	2025-08-18 02:55:15.460096+00	\N
a2dbca2a-6966-4e0d-951d-24fb168e5af2	123 Broadway	\N	Louisville	SC	43503	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	52960a86-cfc0-476b-b93a-eac715fd2227	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.477942+00	2025-08-18 02:55:15.477942+00	\N
cd37d0ec-fa60-425f-b17e-9767a2a2ce2d	111 Main St	Suite 1027	Boston	RI	15940	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	52960a86-cfc0-476b-b93a-eac715fd2227	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.481539+00	2025-08-18 02:55:15.481539+00	\N
9ab8ce18-1853-4309-9d94-3c448506456e	456 Washington Blvd	\N	Baltimore	OR	62333	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	a40ac272-8ac6-455e-8d84-bd776c8a067e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.499083+00	2025-08-18 02:55:15.499083+00	\N
0bc65830-0fd4-45b3-87fd-5d35aff9a218	666 5th Ave	\N	Los Angeles	CT	42379	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	b27f9347-98a5-4539-a8a3-cec91d478d58	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.516442+00	2025-08-18 02:55:15.516442+00	\N
74b95d17-d4a3-40ca-bbde-b1753d893871	666 Maple Dr	\N	Los Angeles	PA	54074	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	2ee58325-4cf0-4ccb-99a2-4d2259a7c52a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.533459+00	2025-08-18 02:55:15.533459+00	\N
96f0937b-f814-4675-9dab-2a3a2d57c707	789 Park Place	\N	Austin	WA	41562	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	0eb4c92d-9868-4774-9318-f87dce8e1ce1	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.550105+00	2025-08-18 02:55:15.550105+00	\N
8af68f05-baa3-40a2-acaa-aefd85863933	456 Lexington Ave	\N	Oakland	SD	86535	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	a65d6716-0816-480b-a6a6-77b4b62f9330	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.570618+00	2025-08-18 02:55:15.570618+00	\N
674221a4-f30f-4988-9d78-39ebf134f3ce	333 Oak Ave	\N	Phoenix	CO	16367	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	367e6934-6b67-497f-888a-53155fa4fbc8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.595135+00	2025-08-18 02:55:15.595135+00	\N
5d5551e0-cfff-4788-a1d7-cab4ff98e0c9	666 Pine Rd	\N	Seattle	PA	74429	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	2c88a6c9-6f3b-4fd8-86fa-fd0581c2dcb2	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.61337+00	2025-08-18 02:55:15.61337+00	\N
4538010f-766e-47be-9c36-0d4aac2880ba	999 Oak Ave	\N	Jacksonville	HI	51139	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	ceb3f035-6384-4650-b385-02b8c704f477	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.635201+00	2025-08-18 02:55:15.635201+00	\N
cb6e3a6e-d051-40aa-8127-e1310e758c5a	555 Madison Ave	\N	Denver	MS	47624	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	0a518a68-b89c-4e08-aee0-c05334e7dc57	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.647434+00	2025-08-18 02:55:15.647434+00	\N
b433c3ae-8645-4bfd-808d-ba5d2c01ed3e	333 Park Ave	\N	San Francisco	KY	90862	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	b19ac50e-e030-41bb-9671-53b1dd331a30	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.659702+00	2025-08-18 02:55:15.659702+00	\N
0a249fef-d262-4f1e-88d4-755eef9fb385	123 5th Ave	Suite 948	Indianapolis	OH	14070	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	b19ac50e-e030-41bb-9671-53b1dd331a30	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.661591+00	2025-08-18 02:55:15.661591+00	\N
918aa27f-38d0-48c3-b408-9de3be44dad2	777 Cedar Ln	\N	Denver	CA	27680	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	01b05834-bb0d-43c8-b4da-ed27dbd912a9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.680883+00	2025-08-18 02:55:15.680883+00	\N
fdf3ebda-2533-47f8-8756-7c0888f61082	333 Broadway	\N	Las Vegas	MT	81481	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	e1e0af9b-b354-492c-ad7a-1eac6822b94f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.690118+00	2025-08-18 02:55:15.690118+00	\N
73fc6bb6-c20a-48be-890b-d86473256ca3	666 Pine Rd	\N	Louisville	ID	57252	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	120b214a-074b-4a9a-9fc5-ca36d2a2f9b3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.702927+00	2025-08-18 02:55:15.702927+00	\N
34a35b1d-b8ae-46e6-b0a8-7d3003c080d5	456 Central Ave	\N	Denver	SD	17015	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	f62f2ffe-bc11-4ad4-aa1e-394c378a0961	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.714701+00	2025-08-18 02:55:15.714701+00	\N
6f717a2c-54a1-44ae-b560-27e5df190d16	444 Madison Ave	\N	Arlington	MN	36654	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	376ca675-1847-46a9-bca9-e44389fa2b37	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.728513+00	2025-08-18 02:55:15.728513+00	\N
d8ba2eed-3a62-4e3c-8d00-8531d8306366	555 Riverside Dr	\N	Philadelphia	FL	15524	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	f6fba39d-6836-4bae-9510-36e23bb12d7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.73951+00	2025-08-18 02:55:15.73951+00	\N
cdd552a5-14af-4c3f-a3f7-9b274185fc2c	789 Oak Ave	\N	Los Angeles	FL	85536	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	97b27d1b-a376-4804-a447-ecd4dd1cda7f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.752625+00	2025-08-18 02:55:15.752625+00	\N
eb07d41b-f6eb-4202-abe2-2a17efab087b	555 Riverside Dr	Suite 896	New York	MT	22225	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	97b27d1b-a376-4804-a447-ecd4dd1cda7f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.754479+00	2025-08-18 02:55:15.754479+00	\N
88cf8cc2-e91e-4b51-ad3c-8416235d88ad	555 Washington Blvd	\N	Detroit	MN	29880	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	bd856c40-6e97-4f86-a3b9-7aba2618a39c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.762075+00	2025-08-18 02:55:15.762075+00	\N
21c5a23c-18e7-4921-b92a-864dbbb4da42	456 Washington Blvd	\N	Tucson	OR	56706	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	2a4ec289-cd62-496d-9635-e0b2959234c9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.776782+00	2025-08-18 02:55:15.776782+00	\N
727578c3-c6d9-4004-a5a3-56d16377c0b2	555 Madison Ave	\N	Louisville	NY	99914	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	a3359bff-5b5f-4e0a-a8fc-d5b45b3a0024	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.787322+00	2025-08-18 02:55:15.787322+00	\N
50b8ad68-bc2e-4dbc-9314-f7f9cdc28306	456 Pine Rd	\N	Philadelphia	VA	67880	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	0c444676-f5e5-4275-b438-caff065b3d22	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.798445+00	2025-08-18 02:55:15.798445+00	\N
ae9a396c-938f-452d-9a11-348820c0a71c	789 Maple Dr	Suite 175	Philadelphia	TN	35386	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	0c444676-f5e5-4275-b438-caff065b3d22	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.800487+00	2025-08-18 02:55:15.800487+00	\N
64bfbc4f-148d-4511-8d75-32dd8d7bf118	789 Madison Ave	\N	Sacramento	MA	91954	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	4f586d8f-4b05-4bb9-8b3a-70ccaccfefd6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.814408+00	2025-08-18 02:55:15.814408+00	\N
e88e548f-67b2-4e1e-9886-62bce5d55aaf	222 Oak Ave	\N	Detroit	NH	22778	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	b2eba624-0dd1-4178-964d-837b6959c1a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.828868+00	2025-08-18 02:55:15.828868+00	\N
cafc1218-1fd4-48fa-a7b3-4bb8db100385	987 5th Ave	Suite 310	Boston	AR	63301	United States	f	575555b6-e01a-4991-a6ba-a88e5da3d3d5	b2eba624-0dd1-4178-964d-837b6959c1a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.830659+00	2025-08-18 02:55:15.830659+00	\N
a20b890f-dbfc-460d-8117-4bac3f14d2bc	777 Park Ave	\N	Chicago	CO	85351	United States	t	d931297e-8f4e-42bf-881b-3362c4f35754	cd4a1698-ccc4-4e51-b67d-0359d996f47e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.845283+00	2025-08-18 02:55:15.845283+00	\N
\.


--
-- TOC entry 3926 (class 0 OID 16621)
-- Dependencies: 215
-- Data for Name: calls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calls (id, subject, description, duration, outcome, "scheduledAt", "completedAt", metadata, "createdAt", "updatedAt", "contactId", "dealId", "leadId", "assignedToId", "createdById") FROM stdin;
\.


--
-- TOC entry 3959 (class 0 OID 17433)
-- Dependencies: 248
-- Data for Name: communication_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.communication_attachments (id, filename, original_name, mime_type, size, url, communication_id, created_at) FROM stdin;
\.


--
-- TOC entry 3944 (class 0 OID 17017)
-- Dependencies: 233
-- Data for Name: communication_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.communication_types (id, name, code, description, icon, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3958 (class 0 OID 17394)
-- Dependencies: 247
-- Data for Name: communications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.communications (id, type_id, subject, content, direction, scheduled_at, sent_at, received_at, external_id, user_id, contact_id, lead_id, deal_id, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3937 (class 0 OID 16819)
-- Dependencies: 226
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, website, domain, industry_id, size_id, revenue, external_id, tenant_id, created_at, updated_at, created_by, deleted_at) FROM stdin;
e124301d-e9af-42c1-a361-0c0882547f7a	TechCorp Solutions	https://techcorp.com	\N	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	\N	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 13:11:19.379094+00	2025-08-14 13:11:19.379094+00	\N	\N
b5de6862-01e7-4e04-a831-3dfe95563c9c	TechCorp Solutions	https://techcorp.com	techcorp.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	25000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.516964+00	2025-08-15 08:10:15.516964+00	\N	\N
7d89c2bd-9fd9-4bf2-b5f9-644e244afe65	HealthFirst Medical	https://healthfirst.com	healthfirst.com	c94caae6-5d0c-449e-939d-58ef35462ddb	536bf6db-1ba6-4549-ad8c-687095c5e195	8500000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.524931+00	2025-08-15 08:10:15.524931+00	\N	\N
6b2e822a-b5c8-480d-ac5e-7a3e0ec78e98	Global Finance Group	https://globalfinance.com	globalfinance.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	150000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.528888+00	2025-08-15 08:10:15.528888+00	\N	\N
8152c747-c080-46cb-86a4-730ef9e79f7b	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	77677d26-f561-4632-8487-14b177da9858	45000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.531648+00	2025-08-15 08:10:15.531648+00	\N	\N
cc5c3527-dc17-48b7-830e-c24d5378861a	Retail Plus Stores	https://retailplus.com	retailplus.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	12000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:10:15.533886+00	2025-08-15 08:10:15.533886+00	\N	\N
30d8b0b0-2d20-427f-a456-f261f662ba99	TechCorp Solutions	https://techcorp.com	techcorp.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	25000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.513968+00	2025-08-15 08:11:07.513968+00	\N	\N
82394f79-e8ee-41c9-94bf-1ff2acad6975	HealthFirst Medical	https://healthfirst.com	healthfirst.com	c94caae6-5d0c-449e-939d-58ef35462ddb	536bf6db-1ba6-4549-ad8c-687095c5e195	8500000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.521768+00	2025-08-15 08:11:07.521768+00	\N	\N
91ebf292-9cfc-494d-957e-ee34f9137fec	Global Finance Group	https://globalfinance.com	globalfinance.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	150000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.52369+00	2025-08-15 08:11:07.52369+00	\N	\N
570512eb-aabf-42b9-b485-3df0effee807	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	77677d26-f561-4632-8487-14b177da9858	45000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.52565+00	2025-08-15 08:11:07.52565+00	\N	\N
af5e910f-9054-4c3f-b509-c3815aaade72	Retail Plus Stores	https://retailplus.com	retailplus.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	12000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:11:07.528476+00	2025-08-15 08:11:07.528476+00	\N	\N
e8849080-2368-478d-b4ce-b87ebd7974b2	TechCorp Solutions	https://techcorp.com	techcorp.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	25000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.926212+00	2025-08-15 08:14:15.926212+00	\N	\N
e23a12d3-3380-4918-ac31-39bfe80a8211	HealthFirst Medical	https://healthfirst.com	healthfirst.com	c94caae6-5d0c-449e-939d-58ef35462ddb	536bf6db-1ba6-4549-ad8c-687095c5e195	8500000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.934181+00	2025-08-15 08:14:15.934181+00	\N	\N
50ea3d2c-f3e3-4460-ad34-49bdb87a325a	Global Finance Group	https://globalfinance.com	globalfinance.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	150000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.936614+00	2025-08-15 08:14:15.936614+00	\N	\N
04ba9ed7-7b34-4442-9fae-6367d79481cf	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	77677d26-f561-4632-8487-14b177da9858	45000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.938972+00	2025-08-15 08:14:15.938972+00	\N	\N
d6d87d98-9660-4cfc-85c0-2e2df0ebe0e9	Retail Plus Stores	https://retailplus.com	retailplus.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	12000000.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:14:15.941279+00	2025-08-15 08:14:15.941279+00	\N	\N
ec4f7848-824e-4fb6-9551-ea1473dcfb3f	TechCorp Solutions	https://techcorp.com	techcorp.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	74046472.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.15318+00	2025-08-15 08:22:51.15318+00	\N	\N
ca85637b-3852-444f-af3f-a42b032191be	HealthFirst Medical	https://healthfirst.com	healthfirst.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	65154382.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.161512+00	2025-08-15 08:22:51.161512+00	\N	\N
7c7644ee-cb23-4dfb-8ed5-39edae86c278	Global Finance Group	https://globalfinance.com	globalfinance.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	26560897.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.164674+00	2025-08-15 08:22:51.164674+00	\N	\N
6c1effb0-40d8-4e3c-ad9a-1a80f7371bf6	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	6401692.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.167834+00	2025-08-15 08:22:51.167834+00	\N	\N
9dc9056f-a165-4002-a9a6-552dd5305f7a	Retail Plus Stores	https://retailplus.com	retailplus.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	8477326.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.170249+00	2025-08-15 08:22:51.170249+00	\N	\N
005fd3c7-3b66-4d04-a14f-c719a3147f1d	Digital Dynamics	https://digitaldynamics.com	digitaldynamics.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	536bf6db-1ba6-4549-ad8c-687095c5e195	46744236.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.17247+00	2025-08-15 08:22:51.17247+00	\N	\N
a438d48a-ee50-448e-852e-7a7d4d5c704b	Green Energy Corp	https://greenenergy.com	greenenergy.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	536bf6db-1ba6-4549-ad8c-687095c5e195	96223370.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.174655+00	2025-08-15 08:22:51.174655+00	\N	\N
216032e1-d6c7-4a1f-a012-08c08b627b8d	Creative Marketing Agency	https://creativemarketing.com	creativemarketing.com	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	44037720.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.17665+00	2025-08-15 08:22:51.17665+00	\N	\N
a8eb5b3c-2efc-40f7-b64b-e05ce198507d	Legal Associates LLP	https://legalassociates.com	legalassociates.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	57094228.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.180458+00	2025-08-15 08:22:51.180458+00	\N	\N
139e04fa-bdec-43d5-bb91-2848815d7a07	Educational Excellence	https://educationalexcellence.com	educationalexcellence.com	ed699425-b383-4835-8ce4-e180956ac4fe	04ac49c0-e454-4b18-b5df-10469daaab30	88847850.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.183449+00	2025-08-15 08:22:51.183449+00	\N	\N
63ac9507-3b40-4410-96f6-deaf949d8aa9	Transportation Solutions	https://transportationsolutions.com	transportationsolutions.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	26785350.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.18646+00	2025-08-15 08:22:51.18646+00	\N	\N
ea6652d1-dbd5-4bee-a831-60b6aacd706a	Real Estate Partners	https://realestatepartners.com	realestatepartners.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	3104749.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.18958+00	2025-08-15 08:22:51.18958+00	\N	\N
be65e1b5-8ce7-4426-b5f8-1625321a854c	Consulting Experts	https://consultingexperts.com	consultingexperts.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	79620047.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.192434+00	2025-08-15 08:22:51.192434+00	\N	\N
a3933216-7f83-41aa-953a-c805b5c47789	Food & Beverage Co	https://foodbeverage.com	foodbeverage.com	c94caae6-5d0c-449e-939d-58ef35462ddb	04ac49c0-e454-4b18-b5df-10469daaab30	44560805.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.195072+00	2025-08-15 08:22:51.195072+00	\N	\N
cfca2e1f-8426-47f9-b582-07400862bd4c	Entertainment Studios	https://entertainmentstudios.com	entertainmentstudios.com	ed699425-b383-4835-8ce4-e180956ac4fe	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	48622503.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:22:51.198657+00	2025-08-15 08:22:51.198657+00	\N	\N
35b59ce3-077f-4ea3-b57d-afc7b50e6613	TechCorp Solutions	https://techcorp.com	techcorp.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	536bf6db-1ba6-4549-ad8c-687095c5e195	49515629.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.391048+00	2025-08-17 16:27:08.391048+00	\N	\N
64c5858d-837d-4ad3-9878-cf5d29e7dd56	HealthFirst Medical	https://healthfirst.com	healthfirst.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	77626131.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.394933+00	2025-08-17 16:27:08.394933+00	\N	\N
01be7874-0098-4ec5-9d48-9393ca57bc98	Global Finance Group	https://globalfinance.com	globalfinance.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	77677d26-f561-4632-8487-14b177da9858	40626958.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.398127+00	2025-08-17 16:27:08.398127+00	\N	\N
a94483dd-5541-4a47-a4ff-7fca34c3c0dc	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	536bf6db-1ba6-4549-ad8c-687095c5e195	39781067.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.400456+00	2025-08-17 16:27:08.400456+00	\N	\N
1f8f16a7-3562-4df8-bbdc-a0e4b6e14cee	Retail Plus Stores	https://retailplus.com	retailplus.com	c94caae6-5d0c-449e-939d-58ef35462ddb	04ac49c0-e454-4b18-b5df-10469daaab30	72387112.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.403094+00	2025-08-17 16:27:08.403094+00	\N	\N
446386c2-676b-47e4-bf0b-e05774eb791a	Digital Dynamics	https://digitaldynamics.com	digitaldynamics.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	5391476.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.405889+00	2025-08-17 16:27:08.405889+00	\N	\N
88463116-9630-499e-8ae9-76aeacf2851f	Green Energy Corp	https://greenenergy.com	greenenergy.com	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	2065227.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.408302+00	2025-08-17 16:27:08.408302+00	\N	\N
233915d4-3561-4a96-b8f4-539aee58d54a	Creative Marketing Agency	https://creativemarketing.com	creativemarketing.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	536bf6db-1ba6-4549-ad8c-687095c5e195	27411647.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.411753+00	2025-08-17 16:27:08.411753+00	\N	\N
08d8f3c1-53ff-4445-9832-a1b02b3e0a98	Legal Associates LLP	https://legalassociates.com	legalassociates.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	19209740.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.41415+00	2025-08-17 16:27:08.41415+00	\N	\N
4ccc9467-319f-468b-9b6a-ce29a5195ed6	Educational Excellence	https://educationalexcellence.com	educationalexcellence.com	bd53cb65-5771-469f-8a74-3c843566505b	77677d26-f561-4632-8487-14b177da9858	95409428.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.416226+00	2025-08-17 16:27:08.416226+00	\N	\N
f95d5433-17a8-4a25-8a87-dfad8ac5793d	Transportation Solutions	https://transportationsolutions.com	transportationsolutions.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	77677d26-f561-4632-8487-14b177da9858	30528825.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.418645+00	2025-08-17 16:27:08.418645+00	\N	\N
c920fe2a-7619-46cf-80cd-18d08eceba2b	Real Estate Partners	https://realestatepartners.com	realestatepartners.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	50684754.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.420692+00	2025-08-17 16:27:08.420692+00	\N	\N
1de20cb2-4b55-4a4d-9eba-f10e78c4e09f	Consulting Experts	https://consultingexperts.com	consultingexperts.com	ed699425-b383-4835-8ce4-e180956ac4fe	04ac49c0-e454-4b18-b5df-10469daaab30	3796348.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.424963+00	2025-08-17 16:27:08.424963+00	\N	\N
6d8cd793-a016-4ab7-9b39-b65b6aaecd0e	Food & Beverage Co	https://foodbeverage.com	foodbeverage.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	36379227.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.427658+00	2025-08-17 16:27:08.427658+00	\N	\N
c2c99d42-6aab-4af6-9f5f-1c9833d34799	Entertainment Studios	https://entertainmentstudios.com	entertainmentstudios.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	77445067.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.431388+00	2025-08-17 16:27:08.431388+00	\N	\N
d0f76f75-3ae1-4cdd-9992-834dd2c73352	TechCorp Solutions	https://techcorp.com	techcorp.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	536bf6db-1ba6-4549-ad8c-687095c5e195	15821534.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.915714+00	2025-08-18 02:55:14.915714+00	\N	\N
44559722-1c94-4a08-a4ca-e261232fc1dc	HealthFirst Medical	https://healthfirst.com	healthfirst.com	ed699425-b383-4835-8ce4-e180956ac4fe	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	82322895.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.923944+00	2025-08-18 02:55:14.923944+00	\N	\N
79920099-87c1-4d41-a729-e0d094024b16	Global Finance Group	https://globalfinance.com	globalfinance.com	c94caae6-5d0c-449e-939d-58ef35462ddb	04ac49c0-e454-4b18-b5df-10469daaab30	22668557.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.926127+00	2025-08-18 02:55:14.926127+00	\N	\N
cf8480e6-4b3d-4019-8609-55d1c281f9da	Innovation Manufacturing	https://innovationmfg.com	innovationmfg.com	bd53cb65-5771-469f-8a74-3c843566505b	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	50412377.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.928107+00	2025-08-18 02:55:14.928107+00	\N	\N
63b90681-c4e2-4cbb-befc-fa91dff784ff	Retail Plus Stores	https://retailplus.com	retailplus.com	c94caae6-5d0c-449e-939d-58ef35462ddb	d3c32cd9-c5d6-4eae-8232-7ac769f3a197	26035353.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.930145+00	2025-08-18 02:55:14.930145+00	\N	\N
34021023-0fb6-4c0d-9bcd-d6837527fbeb	Digital Dynamics	https://digitaldynamics.com	digitaldynamics.com	ed699425-b383-4835-8ce4-e180956ac4fe	536bf6db-1ba6-4549-ad8c-687095c5e195	14804854.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.932007+00	2025-08-18 02:55:14.932007+00	\N	\N
3a794c42-3fba-4420-9429-e8f748b8df62	Green Energy Corp	https://greenenergy.com	greenenergy.com	c94caae6-5d0c-449e-939d-58ef35462ddb	536bf6db-1ba6-4549-ad8c-687095c5e195	32028443.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.933836+00	2025-08-18 02:55:14.933836+00	\N	\N
9c4b0c2c-a0c0-4a83-b3e0-a49720c81efa	Creative Marketing Agency	https://creativemarketing.com	creativemarketing.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	536bf6db-1ba6-4549-ad8c-687095c5e195	44524189.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.93549+00	2025-08-18 02:55:14.93549+00	\N	\N
5dd6c10e-e69f-4605-af41-15a4bfcd08b9	Legal Associates LLP	https://legalassociates.com	legalassociates.com	c94caae6-5d0c-449e-939d-58ef35462ddb	77677d26-f561-4632-8487-14b177da9858	74930966.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.937527+00	2025-08-18 02:55:14.937527+00	\N	\N
6e29d6c2-227a-4659-8e7c-dd92252ab48e	Educational Excellence	https://educationalexcellence.com	educationalexcellence.com	107996e0-1768-4ce1-85ef-6b7e5e5830e6	04ac49c0-e454-4b18-b5df-10469daaab30	60869794.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.939959+00	2025-08-18 02:55:14.939959+00	\N	\N
57067e69-33eb-49da-aa15-16734a81c54c	Transportation Solutions	https://transportationsolutions.com	transportationsolutions.com	ed699425-b383-4835-8ce4-e180956ac4fe	04ac49c0-e454-4b18-b5df-10469daaab30	40334594.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.942334+00	2025-08-18 02:55:14.942334+00	\N	\N
e1610917-e0ac-4ca7-b679-41f9fd999ede	Real Estate Partners	https://realestatepartners.com	realestatepartners.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	536bf6db-1ba6-4549-ad8c-687095c5e195	78684628.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.944366+00	2025-08-18 02:55:14.944366+00	\N	\N
6ebdf198-7536-4165-a182-8662e0669bcc	Consulting Experts	https://consultingexperts.com	consultingexperts.com	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	15975195.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.946329+00	2025-08-18 02:55:14.946329+00	\N	\N
cf676777-5028-4d3b-b495-86915b78be21	Food & Beverage Co	https://foodbeverage.com	foodbeverage.com	da0ea04d-7668-4b8f-9fcd-6ee9351f38f8	04ac49c0-e454-4b18-b5df-10469daaab30	17208605.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.948109+00	2025-08-18 02:55:14.948109+00	\N	\N
c22d69b8-2733-47dc-804d-fa156cb38bc2	Entertainment Studios	https://entertainmentstudios.com	entertainmentstudios.com	bd53cb65-5771-469f-8a74-3c843566505b	536bf6db-1ba6-4549-ad8c-687095c5e195	90835233.00	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:14.949871+00	2025-08-18 02:55:14.949871+00	\N	\N
\.


--
-- TOC entry 3935 (class 0 OID 16751)
-- Dependencies: 224
-- Data for Name: company_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_sizes (id, name, code, description, min_employees, max_employees, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
d3c32cd9-c5d6-4eae-8232-7ac769f3a197	1-10 employees	SMALL	\N	1	10	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.175409+00	2025-08-14 10:06:11.175409+00	\N
536bf6db-1ba6-4549-ad8c-687095c5e195	11-50 employees	MEDIUM	\N	11	50	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.178617+00	2025-08-14 10:06:11.178617+00	\N
77677d26-f561-4632-8487-14b177da9858	51-200 employees	LARGE	\N	51	200	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.182189+00	2025-08-14 10:06:11.182189+00	\N
04ac49c0-e454-4b18-b5df-10469daaab30	201+ employees	ENTERPRISE	\N	201	\N	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.185243+00	2025-08-14 10:06:11.185243+00	\N
\.


--
-- TOC entry 3940 (class 0 OID 16876)
-- Dependencies: 229
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, first_name, last_name, title, department, company_id, original_source, email_opt_in, sms_opt_in, call_opt_in, tenant_id, created_at, updated_at, created_by, deleted_at, owner_id) FROM stdin;
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
b82e055b-d3c7-45e2-9faf-8d0868981976	Test	Contact	\N	\N	\N	\N	f	f	f	4832fed8-e0b5-4f01-9b1c-09710c9a4555	\N	\N	0f4062f4-cde1-4a4e-83e4-2be22f02368b	2025-08-17 18:26:04.124942+00	ba774a5b-22b2-4766-b985-97548b2380dc
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
-- TOC entry 3965 (class 0 OID 17623)
-- Dependencies: 254
-- Data for Name: custom_field_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_field_values (id, field_id, entity_id, entity_type, text_value, number_value, decimal_value, boolean_value, date_value, json_value, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3964 (class 0 OID 17607)
-- Dependencies: 253
-- Data for Name: custom_fields; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_fields (id, name, label, type, entity_type, is_required, is_unique, default_value, options, lookup_entity, validation, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3966 (class 0 OID 17676)
-- Dependencies: 255
-- Data for Name: custom_objects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_objects (id, name, label, plural_label, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3956 (class 0 OID 17349)
-- Dependencies: 245
-- Data for Name: deal_stage_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deal_stage_history (id, deal_id, from_stage_id, to_stage_id, from_amount, to_amount, from_probability, to_probability, from_currency, to_currency, from_expected_close_date, to_expected_close_date, change_reason, notes, moved_at, moved_by) FROM stdin;
\.


--
-- TOC entry 3951 (class 0 OID 17162)
-- Dependencies: 240
-- Data for Name: deals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deals (id, name, amount, currency, probability, pipeline_id, stage_id, expected_close_date, actual_close_date, company_id, contact_id, assigned_user_id, tenant_id, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- TOC entry 3947 (class 0 OID 17065)
-- Dependencies: 236
-- Data for Name: email_address_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_address_types (id, name, code, description, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
cf571e53-cc14-44cb-8a61-d195223ea970	Personal	PERSONAL	Personal email address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.466858+00	2025-08-15 08:15:49.466858+00	\N
03ee8151-fd6c-4d31-8b61-e9c8e786450b	Work	WORK	Work email address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.469286+00	2025-08-15 08:15:49.469286+00	\N
b4012606-e84f-4626-8544-144e1ed66a3b	Other	OTHER	Other email address	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.472099+00	2025-08-15 08:15:49.472099+00	\N
\.


--
-- TOC entry 3961 (class 0 OID 17486)
-- Dependencies: 250
-- Data for Name: email_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_addresses (id, email, is_primary, is_verified, type_id, entity_id, entity_type, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
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
c077093b-b858-4a93-85ea-4ef1f94a2254	michelle.white@gmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	5417330b-bb97-44d5-9854-128d4ad23cc0	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.659283+00	2025-08-17 13:44:22.659283+00	\N
a3067377-bc84-4d5e-ab90-e876b020a68f	danielthompson780@hotmail.com	t	f	cf571e53-cc14-44cb-8a61-d195223ea970	6cc01ce7-f735-45c6-9482-8f85001ae6b9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.667553+00	2025-08-17 13:44:22.667553+00	\N
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
-- TOC entry 3934 (class 0 OID 16735)
-- Dependencies: 223
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
-- TOC entry 3938 (class 0 OID 16843)
-- Dependencies: 227
-- Data for Name: lead_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lead_statuses (id, name, code, description, color, "order", is_active, is_system, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
dac58300-a121-423c-88d6-40b920010b01	New	NEW	\N	#3B82F6	1	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.138357+00	2025-08-14 10:06:11.138357+00	\N
875d0d12-2623-436b-bdcc-cbf5925d2483	Contacted	CONTACTED	\N	#F59E0B	2	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.141485+00	2025-08-14 10:06:11.141485+00	\N
7ca5b2a7-ba91-44c1-93d1-c65597bcf834	Qualified	QUALIFIED	\N	#10B981	3	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.143955+00	2025-08-14 10:06:11.143955+00	\N
fef00eb6-316e-4544-aeb2-2b7292774fcd	Unqualified	UNQUALIFIED	\N	#EF4444	4	t	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.146459+00	2025-08-14 10:06:11.146459+00	\N
\.


--
-- TOC entry 3939 (class 0 OID 16860)
-- Dependencies: 228
-- Data for Name: lead_temperatures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lead_temperatures (id, name, code, description, color, "order", is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
71907089-3599-4f63-bdbd-6ade8988e5ff	Hot	HOT	\N	#EF4444	1	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.150442+00	2025-08-14 10:06:11.150442+00	\N
efd60c77-2ec7-475c-96ec-2abeaee51158	Warm	WARM	\N	#F59E0B	2	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.153747+00	2025-08-14 10:06:11.153747+00	\N
2d5c9742-c4c9-4510-b703-ae83b908a250	Cold	COLD	\N	#3B82F6	3	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.156341+00	2025-08-14 10:06:11.156341+00	\N
\.


--
-- TOC entry 3952 (class 0 OID 17203)
-- Dependencies: 241
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leads (id, first_name, last_name, title, status_id, temperature_id, source, campaign, score, company_id, contact_id, assigned_user_id, marketing_source_id, converted_at, converted_to_deal_id, tenant_id, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- TOC entry 3943 (class 0 OID 17001)
-- Dependencies: 232
-- Data for Name: marketing_asset_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_asset_types (id, name, code, description, color, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3957 (class 0 OID 17372)
-- Dependencies: 246
-- Data for Name: marketing_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_assets (id, name, type_id, url, content, views, clicks, conversions, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3941 (class 0 OID 16898)
-- Dependencies: 230
-- Data for Name: marketing_source_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_source_types (id, name, code, description, color, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3942 (class 0 OID 16914)
-- Dependencies: 231
-- Data for Name: marketing_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_sources (id, name, type_id, medium, campaign, source, content, term, utm_source, utm_medium, utm_campaign, utm_content, utm_term, cost, impressions, clicks, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3928 (class 0 OID 16638)
-- Dependencies: 217
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, subject, content, type, direction, status, "scheduledAt", "sentAt", metadata, "createdAt", "updatedAt", "contactId", "dealId", "leadId", "assignedToId", "createdById") FROM stdin;
\.


--
-- TOC entry 3927 (class 0 OID 16629)
-- Dependencies: 216
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notes (id, title, content, type, metadata, "createdAt", "updatedAt", "contactId", "dealId", "leadId", "assignedToId", "createdById") FROM stdin;
\.


--
-- TOC entry 3946 (class 0 OID 17049)
-- Dependencies: 235
-- Data for Name: phone_number_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.phone_number_types (id, name, code, description, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
c44a42be-cb00-4b09-aba8-7cc55a1b58ab	Mobile	MOBILE	Mobile phone number	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.452194+00	2025-08-15 08:15:49.452194+00	\N
6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	Work	WORK	Work phone number	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.459968+00	2025-08-15 08:15:49.459968+00	\N
47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	Home	HOME	Home phone number	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.462146+00	2025-08-15 08:15:49.462146+00	\N
36466fc7-9a3f-4619-9a80-8634c536ab09	Fax	FAX	Fax number	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.46419+00	2025-08-15 08:15:49.46419+00	\N
\.


--
-- TOC entry 3960 (class 0 OID 17446)
-- Dependencies: 249
-- Data for Name: phone_numbers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.phone_numbers (id, number, extension, is_primary, type_id, entity_id, entity_type, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
b15a8440-ff0a-4730-afad-c0d466842d2f	852 9168 9000	\N	t	\N	2eca6953-1955-4a82-9e1e-4ffb7a89a912	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:23:30.022377+00	2025-08-18 02:23:30.022377+00	\N
f6ce4644-1174-414b-93b6-00ced4beb84e	7689078568975	\N	t	\N	78181568-b3e1-4765-a657-38ccecc3bf26	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:04:21.962833+00	2025-08-17 13:04:21.962833+00	\N
07698be7-15f9-4ef3-bbcc-7b159a6927a0	7689078568975	\N	t	\N	abb14855-358b-457e-9499-e069ceffc550	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:04:33.753785+00	2025-08-17 13:04:33.753785+00	\N
27da493a-9eb0-48a3-9d9d-76eab481942f	8889999222	\N	t	\N	8e678b0a-06cb-4b34-8a09-1a4542408ad8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:14:32.598594+00	2025-08-17 13:14:32.598594+00	\N
7e1cf1bf-e7e4-476a-80b1-8b689a6ddbe4	8889999222	\N	t	\N	80a691c5-750a-4b85-a070-956fbb0bcc12	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:14:44.848208+00	2025-08-17 13:14:44.848208+00	\N
52ec5a6e-92b7-41f2-8223-2ab84af26ba4	555-999-8888	\N	t	\N	26989bab-7b6a-46c0-bf60-daf49dd2fe30	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:19:05.338175+00	2025-08-17 13:19:05.338175+00	\N
54332cb6-fc07-4c44-964a-09135cfe95ab	(206) 140-5128	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	0bf8c763-2842-49b2-b0e9-4a26ec1735c4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.579547+00	2025-08-17 13:44:22.579547+00	\N
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
27b08322-c2f9-4269-8f09-6b8cb6aface9	(214) 202-2451	7728	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	661d7e5f-1697-412d-94dd-28fb861173dc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.692521+00	2025-08-17 13:44:22.692521+00	\N
b915de33-c511-40d3-9f1c-c4d61fcff15f	(404) 103-4790	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	35bbc30a-769d-4998-9801-0c5597357d16	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.698461+00	2025-08-17 13:44:22.698461+00	\N
44e565d3-7db1-43b3-a953-20f72a8c6f44	(713) 374-9670	7463	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	35bbc30a-769d-4998-9801-0c5597357d16	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.700332+00	2025-08-17 13:44:22.700332+00	\N
9b1bc0be-8e13-4677-94e1-4691107926c5	(713) 179-8115	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	9bc72c9f-cd34-40df-94e1-58b980d318c6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.704834+00	2025-08-17 13:44:22.704834+00	\N
c74d7784-f8d5-4f5d-b85c-d40e301d7cfc	(602) 615-7671	8272	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	9bc72c9f-cd34-40df-94e1-58b980d318c6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.707335+00	2025-08-17 13:44:22.707335+00	\N
3aee8cf0-d42b-4f76-bbc9-040bea7eba79	(206) 746-6162	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	4b967856-c128-40ae-8e5d-7b3ed7c2f39e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.713719+00	2025-08-17 13:44:22.713719+00	\N
e384d19e-7361-4749-9f02-ef40876b5ca9	(404) 401-2786	1173	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	4b967856-c128-40ae-8e5d-7b3ed7c2f39e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.715551+00	2025-08-17 13:44:22.715551+00	\N
bb13d2b7-61f9-4bf0-a640-f6c05724df7c	(305) 995-3546	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	d5357fc4-34c7-4ed0-921b-71079274851c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.720304+00	2025-08-17 13:44:22.720304+00	\N
a51af179-9937-43cd-85fb-1c86e2484e00	(404) 824-1095	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	39ffe7b8-133f-4c18-82c4-6a6d9163f5e4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.72566+00	2025-08-17 13:44:22.72566+00	\N
dfec88ad-050d-4a79-9af0-4c36508d6ba7	(312) 344-8123	1647	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	39ffe7b8-133f-4c18-82c4-6a6d9163f5e4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.727537+00	2025-08-17 13:44:22.727537+00	\N
ab28759b-4d96-43ce-857a-0d984d3af3e6	(312) 188-1921	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	c835bac7-9ab5-4fc6-97a2-81d8d91b908a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.734028+00	2025-08-17 13:44:22.734028+00	\N
149ec3e8-8e1c-432f-bc25-1bc3c29eed9a	(404) 498-2856	9244	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	c835bac7-9ab5-4fc6-97a2-81d8d91b908a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.736478+00	2025-08-17 13:44:22.736478+00	\N
d82e0d83-206d-44cd-949d-0c48345a10a6	(713) 123-4960	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	45582b4d-b0e3-48e4-b8e3-958de0648580	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.744502+00	2025-08-17 13:44:22.744502+00	\N
0c005ed7-5526-4315-a585-5babc80a7518	(404) 658-1026	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	d612c904-77a1-42e9-8e0b-71ba452fa196	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.750464+00	2025-08-17 13:44:22.750464+00	\N
05585a8e-91a4-4bf9-a5d7-ba2496198711	(303) 489-8572	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	d6409070-9d3f-4474-a3ff-fff2adbf0e42	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.758172+00	2025-08-17 13:44:22.758172+00	\N
f4404199-6d30-46d5-aebf-a53d36b9589c	(312) 812-8398	6613	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	d6409070-9d3f-4474-a3ff-fff2adbf0e42	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.760368+00	2025-08-17 13:44:22.760368+00	\N
283ee123-dc7e-433c-a308-5fa1e8493ecd	(713) 936-4072	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	a42da5d5-9f01-4225-b45a-d6dac56f3fe5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.764499+00	2025-08-17 13:44:22.764499+00	\N
eacd8439-e750-4f75-8afc-a5d971da9f47	(305) 609-6029	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2e2350ec-2863-41d0-bea7-210e82e5dafa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.770768+00	2025-08-17 13:44:22.770768+00	\N
6757469b-f097-4953-aa8d-965e26dcccc5	(214) 203-8047	6910	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	2e2350ec-2863-41d0-bea7-210e82e5dafa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.77333+00	2025-08-17 13:44:22.77333+00	\N
a5aaf9e7-450e-4916-8aad-b0f7d7417006	(212) 987-7500	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	898e3e0c-3be0-4f87-9f62-9157c2e70a3d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.779749+00	2025-08-17 13:44:22.779749+00	\N
9f16a73d-ac34-4835-ac0b-27b8d3ff9d49	(212) 318-2993	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	0437461a-1672-4eee-ad3a-af42eae66a89	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.786369+00	2025-08-17 13:44:22.786369+00	\N
594653bf-cf03-4f81-bff8-d9301c22d55a	(212) 725-9212	2760	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	0437461a-1672-4eee-ad3a-af42eae66a89	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.788592+00	2025-08-17 13:44:22.788592+00	\N
52460d2d-74be-49cd-aacf-e351b2207b11	(404) 735-4808	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	df3c4ded-67fa-4cc2-8f04-f8a7d91e41f6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.793824+00	2025-08-17 13:44:22.793824+00	\N
a2a06b2a-ae11-4697-97e6-f74c4371d8b9	(415) 975-9541	1664	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	df3c4ded-67fa-4cc2-8f04-f8a7d91e41f6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.795547+00	2025-08-17 13:44:22.795547+00	\N
f78a145a-cebc-4553-ad0b-053dfa91ea25	(214) 184-2926	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f14577df-3f7b-4df5-93e4-1091ca3d8cdf	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.801237+00	2025-08-17 13:44:22.801237+00	\N
be5a91ce-8440-4a1c-aac1-cd1d86a37ae4	(713) 958-5099	7150	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	f14577df-3f7b-4df5-93e4-1091ca3d8cdf	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.80384+00	2025-08-17 13:44:22.80384+00	\N
373df4e1-f213-4e5e-be35-20b6c5d53f3f	(713) 576-8338	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	c2541b4e-5ea0-4e78-8bfb-b1d801ca1f3b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.812161+00	2025-08-17 13:44:22.812161+00	\N
bdbc8b8c-9a39-4444-9147-ea9a33a20a56	(305) 518-4102	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	090c8640-8c9f-4fbc-a0c7-7cb0691f1f71	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.817733+00	2025-08-17 13:44:22.817733+00	\N
668ae0d0-0ebb-4bed-87ee-d45177e7be6e	(305) 250-9250	3760	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	090c8640-8c9f-4fbc-a0c7-7cb0691f1f71	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.819496+00	2025-08-17 13:44:22.819496+00	\N
d986b7ab-a26a-459f-b27e-6bb591fe1fd0	(617) 141-6245	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	44802c21-4411-42de-ac6d-4026dc903cf5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.824493+00	2025-08-17 13:44:22.824493+00	\N
7b7a4f19-7168-4722-8131-2bf16342a3c2	(214) 183-1044	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	fe86be0d-4c6e-4a05-b069-4d3b5ecec67d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.830785+00	2025-08-17 13:44:22.830785+00	\N
fc08dc87-8eb1-4935-b300-8aeaa8faa605	(713) 708-3314	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	e07c45ab-86f7-4bc1-9791-64f470254f1b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.836887+00	2025-08-17 13:44:22.836887+00	\N
eaf54336-cbb8-4b80-a705-c34b26fefddb	(713) 412-1013	5002	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	e07c45ab-86f7-4bc1-9791-64f470254f1b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.839575+00	2025-08-17 13:44:22.839575+00	\N
5e32612c-dde9-4c0e-b42a-c2fcecbd43f4	(305) 609-8315	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2565104e-5573-49f8-b4dc-45373ef0982f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.844398+00	2025-08-17 13:44:22.844398+00	\N
f7ac33e5-d9a9-47db-af17-6b9f77a0f6f4	(713) 586-1235	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	af50ec3f-7d3d-473f-ae9f-c18554eb1043	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.848388+00	2025-08-17 13:44:22.848388+00	\N
ba67fe44-af38-4709-841c-cc3374cb31d4	(303) 157-6319	6629	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	af50ec3f-7d3d-473f-ae9f-c18554eb1043	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.850113+00	2025-08-17 13:44:22.850113+00	\N
18b459f0-212d-4fad-ad97-5ffbe0ba8687	(312) 480-5525	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	90ac4fe8-2cf9-4d75-be83-1ef8d753e9a6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.856679+00	2025-08-17 13:44:22.856679+00	\N
eadbf97d-39c9-400d-9bc6-f6adfebff375	(206) 314-5172	7962	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	90ac4fe8-2cf9-4d75-be83-1ef8d753e9a6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.858563+00	2025-08-17 13:44:22.858563+00	\N
af705e35-687f-42f0-92ce-b3b731dad1d4	(713) 131-7352	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	4a5649ec-3678-4185-adbd-1b6783e54b1b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.864443+00	2025-08-17 13:44:22.864443+00	\N
a502e2a4-fb59-4bdc-8c15-a01e32d0d18a	(214) 378-5254	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	cd55c2c8-ecd2-487e-a1c4-52c280c2bf4c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.063068+00	2025-08-18 02:55:15.063068+00	\N
8c0d19aa-e30c-47e7-a1d1-79fa8222fa21	(404) 925-6272	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	1899a533-5d7b-4e0c-acde-5a26d519f8fb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.87956+00	2025-08-17 13:44:22.87956+00	\N
a36515f6-3479-437b-91f9-9e592c0c870b	(312) 519-5551	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b7c18cc6-85ac-4800-905f-6e06009b2faa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.885358+00	2025-08-17 13:44:22.885358+00	\N
8e74c627-9620-4e87-98c4-a210f40afd28	(212) 275-6053	8011	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	b7c18cc6-85ac-4800-905f-6e06009b2faa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.887266+00	2025-08-17 13:44:22.887266+00	\N
04662ce7-04a7-4b3a-b4ec-e9175fc3c793	(305) 698-4293	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	12009684-90ba-48ac-aaff-68b85898b876	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.892819+00	2025-08-17 13:44:22.892819+00	\N
73315721-f2fe-4c8d-a9e9-ab34a957b9b8	(312) 337-4814	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	65f26e41-b1d2-42a4-b865-0184d0a253ef	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.899379+00	2025-08-17 13:44:22.899379+00	\N
d0d8734b-0aa0-4d3f-aaa5-df00febc2fa6	(312) 421-5647	5480	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	65f26e41-b1d2-42a4-b865-0184d0a253ef	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.900985+00	2025-08-17 13:44:22.900985+00	\N
f74de247-a6c8-4dc8-baed-aacbbdd68a97	(212) 543-6729	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	51d57c02-0cad-43ab-b5f5-b3fa6876ded7	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.906393+00	2025-08-17 13:44:22.906393+00	\N
25a5ffe5-42d4-4bbd-bd9b-278a1b6b0e8d	(303) 980-6636	3948	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	cd55c2c8-ecd2-487e-a1c4-52c280c2bf4c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.065648+00	2025-08-18 02:55:15.065648+00	\N
2c4e4756-8f0f-4f4c-b35e-1912edfa0919	(415) 238-2266	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2771d43c-c1f9-4bda-9885-f81fea26023c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.08045+00	2025-08-18 02:55:15.08045+00	\N
374c6ddc-9018-4285-a784-9f3d25f0265e	(212) 209-8052	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	cbe1e31a-58ad-4ca5-9885-aaa5cc8caa7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.920058+00	2025-08-17 13:44:22.920058+00	\N
8b89330b-0f3d-4b50-98f0-d71ed3b41f5d	(617) 806-4953	6448	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	cbe1e31a-58ad-4ca5-9885-aaa5cc8caa7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.922837+00	2025-08-17 13:44:22.922837+00	\N
c5f0159f-6140-4381-b1de-0dd1e0d7e25d	(206) 532-8393	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	a8989009-ddeb-4db9-9ca3-5d5a73c3f157	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.930739+00	2025-08-17 13:44:22.930739+00	\N
76838fb4-129e-405b-9e2c-cc7a3cf6907c	(415) 524-4614	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	16646396-7e65-44e9-aa52-7c9d48c0bd5c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.939684+00	2025-08-17 13:44:22.939684+00	\N
85724466-5241-4bc0-95b9-7e9f701d7ca6	(602) 578-8520	4214	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	16646396-7e65-44e9-aa52-7c9d48c0bd5c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.941849+00	2025-08-17 13:44:22.941849+00	\N
53e6aa3b-6090-475b-9014-86dc4993747d	(404) 385-6202	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	75841c1e-be55-4f91-8b2a-285ee3e2c95e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.950119+00	2025-08-17 13:44:22.950119+00	\N
b8db8133-5fec-416b-830d-078c20b7835d	(303) 107-4252	5534	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	75841c1e-be55-4f91-8b2a-285ee3e2c95e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.952561+00	2025-08-17 13:44:22.952561+00	\N
817fa4dc-162e-4f3d-80d9-5f5d3d360fe0	(415) 856-7227	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	87bebaf8-c2ec-4706-9a95-5ce3c56c210d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.961416+00	2025-08-17 13:44:22.961416+00	\N
ad29daa8-2ded-43ff-8a2a-ef0c38cd7415	(305) 872-2490	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	33200ec1-d51c-425f-b835-dd3a2f68d357	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.967786+00	2025-08-17 13:44:22.967786+00	\N
d38a50dc-65a3-4d88-8b4b-a1c688be8ceb	(312) 942-3602	5352	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	33200ec1-d51c-425f-b835-dd3a2f68d357	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.969871+00	2025-08-17 13:44:22.969871+00	\N
64ee3119-ca06-41d0-ae03-739c38d69790	(312) 337-4206	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f3d6d7a4-32d4-4345-868a-20ba08f9e8de	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.979356+00	2025-08-17 13:44:22.979356+00	\N
3884f6bb-9fb5-44f6-8f00-e0a30d4ca68c	(415) 296-9639	8541	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	f3d6d7a4-32d4-4345-868a-20ba08f9e8de	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.981331+00	2025-08-17 13:44:22.981331+00	\N
77f7513a-8fd9-4252-8d5a-39ed422fd1db	(312) 451-6140	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	a52e1a72-fb18-4760-993f-da512aa8ec9a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.988239+00	2025-08-17 13:44:22.988239+00	\N
bc3a0a64-4592-433f-99a9-b78ae10d8ccf	(305) 765-3969	2158	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	a52e1a72-fb18-4760-993f-da512aa8ec9a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.990607+00	2025-08-17 13:44:22.990607+00	\N
fe3ef3f2-8519-4229-8400-e42bd7ec4762	(312) 984-7522	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	a3e05fc1-2374-4f1f-9a62-838b78d9333f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:22.997886+00	2025-08-17 13:44:22.997886+00	\N
451fff40-859e-4a52-a765-a5dd37087b87	(303) 389-6139	1283	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	a3e05fc1-2374-4f1f-9a62-838b78d9333f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.00007+00	2025-08-17 13:44:23.00007+00	\N
5c2ad522-da93-4ae9-a550-0cfdf9ae97d8	(617) 548-5659	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	4ed58860-7eef-4aba-b152-ee469234363b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.00785+00	2025-08-17 13:44:23.00785+00	\N
c65592de-1ce8-4429-8b5f-773557060f3c	(404) 862-3201	1364	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	4ed58860-7eef-4aba-b152-ee469234363b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.009991+00	2025-08-17 13:44:23.009991+00	\N
a9d849fb-bdcc-4014-871f-0098dd079ab0	(404) 738-9818	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	53b9eb8c-555d-45f5-ad60-b135a14dc3fa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.014244+00	2025-08-17 13:44:23.014244+00	\N
48bc54ce-a9ce-4618-9dac-bfeeb6e4febb	(713) 913-5059	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	e918cd8e-64b0-45c9-8310-bf3c4c01598a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.020169+00	2025-08-17 13:44:23.020169+00	\N
4550714b-c46e-4f89-b28c-522a249fc2cf	(305) 876-9161	4899	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	e918cd8e-64b0-45c9-8310-bf3c4c01598a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.022523+00	2025-08-17 13:44:23.022523+00	\N
c5a821f7-79f4-4318-92a8-213e35176fa4	(206) 652-4596	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	ace9c7b8-86e9-4b48-a126-75f22e14fdff	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.030155+00	2025-08-17 13:44:23.030155+00	\N
d76da766-2175-4013-9a4f-88890ec00c41	(214) 283-2612	4310	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	ace9c7b8-86e9-4b48-a126-75f22e14fdff	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.03269+00	2025-08-17 13:44:23.03269+00	\N
66f30801-97b7-47f1-8bd0-e711dc3898aa	(312) 312-3202	1581	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	2771d43c-c1f9-4bda-9885-f81fea26023c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.082352+00	2025-08-18 02:55:15.082352+00	\N
8361211b-0220-4620-9bd0-c290a8b98216	(404) 706-4392	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	267eb4cd-fd86-40db-9a1a-17692fd0e23c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.097326+00	2025-08-18 02:55:15.097326+00	\N
72917751-f15d-47fb-910e-03df31e127b3	(303) 588-2680	6868	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	267eb4cd-fd86-40db-9a1a-17692fd0e23c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.099217+00	2025-08-18 02:55:15.099217+00	\N
75213719-00c0-4bc7-b6f0-11a7771b5585	(312) 533-8729	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	d461e239-611f-4a1c-a768-81bb4c34a0df	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.114114+00	2025-08-18 02:55:15.114114+00	\N
c0a513d8-e141-4268-bf96-5541b9c10766	(214) 691-7024	8368	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	d461e239-611f-4a1c-a768-81bb4c34a0df	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.116245+00	2025-08-18 02:55:15.116245+00	\N
cc1a63bc-86e8-4429-bfa2-a99002e98c67	(206) 143-7209	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	d461e239-611f-4a1c-a768-81bb4c34a0df	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.118721+00	2025-08-18 02:55:15.118721+00	\N
926a8871-5e4b-4633-8021-0e232008c3d0	(713) 114-9231	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	afc348bd-91d6-4d70-b977-a539027e318a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.129262+00	2025-08-18 02:55:15.129262+00	\N
450d9ca4-caef-4269-bc24-c5afb53aaa03	(602) 385-3952	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	9b539c21-7c5d-4a8f-a0ec-87fb99dcda53	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.140225+00	2025-08-18 02:55:15.140225+00	\N
289b0289-20e8-4818-8ad2-cfb7275d885c	(404) 673-7449	10654	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	9b539c21-7c5d-4a8f-a0ec-87fb99dcda53	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.141885+00	2025-08-18 02:55:15.141885+00	\N
4f6f8030-717f-476d-bba6-3cf134d05680	(312) 670-3386	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	85431359-6040-491f-89a6-d18c651dda35	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.154399+00	2025-08-18 02:55:15.154399+00	\N
5cc9108d-9c8d-4dfc-a58a-9d056768ecd3	(305) 776-4623	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	ce38cfeb-efc5-4be9-943d-8a7d13054252	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.163592+00	2025-08-18 02:55:15.163592+00	\N
a07ef26a-551c-4126-bea0-f7e7f9dcd3fa	(404) 365-5503	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	41a1889f-0ce5-44b6-90ae-74f94ae8395f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.176058+00	2025-08-18 02:55:15.176058+00	\N
70da165a-19c6-47d2-953e-d8d4b7937c30	(303) 214-7368	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	29f657bd-ad62-4ff8-9079-e752adb8fc95	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.192357+00	2025-08-18 02:55:15.192357+00	\N
91439dd2-3181-4d28-866e-fee8219ecde3	(713) 428-1767	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	29f657bd-ad62-4ff8-9079-e752adb8fc95	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.194152+00	2025-08-18 02:55:15.194152+00	\N
b9708569-abd7-445f-a8b1-26a67488ab76	(602) 824-2745	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	9e870dbe-365e-47a7-a95c-0f67dd9cebde	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.206423+00	2025-08-18 02:55:15.206423+00	\N
17f9ecfd-04ec-44a9-b34f-5327a5243472	(713) 579-3760	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	7815fdbc-9c74-42e0-bbce-f38f376245b8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.217058+00	2025-08-18 02:55:15.217058+00	\N
4b1c2453-9d96-4c7f-a354-4bdae42b05a4	(206) 659-2075	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b6a49221-833f-4f0e-9a50-c851993efc85	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.229681+00	2025-08-18 02:55:15.229681+00	\N
a49e6ea9-aaa6-47d1-bf06-a2c5cddbf898	(312) 830-4323	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	908904fb-611c-4d96-ac00-112efaad8b5a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.242228+00	2025-08-18 02:55:15.242228+00	\N
5b4ec448-aa49-487f-a7e3-404a897fda8a	(305) 832-8239	5189	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	908904fb-611c-4d96-ac00-112efaad8b5a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.243833+00	2025-08-18 02:55:15.243833+00	\N
124ef206-8844-41f4-90d0-4ad449271b54	(305) 198-2900	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	91fc63e7-940c-4fb1-9c07-c465ac942d49	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.254757+00	2025-08-18 02:55:15.254757+00	\N
dc7a75c8-912f-40e3-8410-fcd5ea3ea0ba	(312) 803-3723	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	91fc63e7-940c-4fb1-9c07-c465ac942d49	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.256446+00	2025-08-18 02:55:15.256446+00	\N
a8600a22-bf46-4aff-9ce4-c9aba8b5a45a	(415) 373-8029	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	8dd1c642-ce9c-4c71-9edb-71cbc4f4fbd4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.263414+00	2025-08-18 02:55:15.263414+00	\N
3a1c122c-435e-4b49-8b98-9aed3599bf8e	(305) 516-2218	1720	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	8dd1c642-ce9c-4c71-9edb-71cbc4f4fbd4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.265125+00	2025-08-18 02:55:15.265125+00	\N
314dc6a8-8916-4340-92db-a4de3d8faf6a	(602) 158-6590	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	23391801-1492-42b3-8dbd-547d8543849e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.275767+00	2025-08-18 02:55:15.275767+00	\N
6dd84207-df8d-4393-9604-d7e9d04d5837	(214) 366-7770	10989	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	23391801-1492-42b3-8dbd-547d8543849e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.277473+00	2025-08-18 02:55:15.277473+00	\N
98ff8865-6bba-4cc3-8ae9-5dee35c0cccd	(206) 189-4676	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	31ecbbc0-e8e3-40d4-a154-82a3e5d00c26	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.291145+00	2025-08-18 02:55:15.291145+00	\N
ab275a9c-f47c-4ff1-8199-e5f2464897dc	(212) 271-9558	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	31ecbbc0-e8e3-40d4-a154-82a3e5d00c26	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.293313+00	2025-08-18 02:55:15.293313+00	\N
c7243ae9-413f-4ffb-a045-ef55fddaa2f8	(303) 282-7731	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	646d6f02-718a-4c53-bbbd-d58eea128eae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.305739+00	2025-08-18 02:55:15.305739+00	\N
dd5cdab8-5482-42ca-9fd1-8c7bc3ac27b1	(713) 429-4052	8211	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	646d6f02-718a-4c53-bbbd-d58eea128eae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.307611+00	2025-08-18 02:55:15.307611+00	\N
0de56fd3-057e-4a30-882e-a796408000ad	(206) 433-4204	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	121e9087-021e-40b7-940d-67ad17509dfc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.322046+00	2025-08-18 02:55:15.322046+00	\N
eed894e5-6893-4088-affe-75476cb952b8	(312) 794-6951	6652	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	121e9087-021e-40b7-940d-67ad17509dfc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.323684+00	2025-08-18 02:55:15.323684+00	\N
7f5772fb-0850-4815-9c5a-1d5806bafa08	(212) 833-3996	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	236a6915-c1e6-4383-84a4-e1beeae48946	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.335692+00	2025-08-18 02:55:15.335692+00	\N
d421a9a5-500c-4e00-b776-2074d0143c19	(214) 224-9220	5972	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	236a6915-c1e6-4383-84a4-e1beeae48946	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.337352+00	2025-08-18 02:55:15.337352+00	\N
266b2829-9778-4ffd-ade9-020d085970ce	(404) 574-8774	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	ee54ca3b-fe64-472e-807c-f04975020c02	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.199082+00	2025-08-17 13:44:23.199082+00	\N
d573731e-a33c-414c-9625-aed4ebf7e34c	(312) 303-3970	4940	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	ee54ca3b-fe64-472e-807c-f04975020c02	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.200847+00	2025-08-17 13:44:23.200847+00	\N
6a3a99f6-dee2-4c5b-b3e5-0606b29ceddd	(303) 766-3533	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	37df802c-9567-49cd-ac53-32844bfac8e9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.349244+00	2025-08-18 02:55:15.349244+00	\N
83286d8c-cbf3-4a45-8cb5-2d7519eef076	(404) 949-4769	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	287bc30a-d62a-4e07-a6f8-c5046d07f99e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.369788+00	2025-08-18 02:55:15.369788+00	\N
dab91ad2-d3c7-48f0-9d85-f3c1b72bdbad	(312) 835-5626	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	54c1338c-8fa7-4983-9757-423a70ef6cf5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.400784+00	2025-08-18 02:55:15.400784+00	\N
c072a086-4bb1-43e1-9d5a-779c3303d695	(312) 912-1758	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b24ead22-d7df-4e0f-a8f5-79dd1d93f71f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.442094+00	2025-08-18 02:55:15.442094+00	\N
d7b9d587-15ca-43b0-984d-0e3aa6944a37	(415) 924-3697	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	52960a86-cfc0-476b-b93a-eac715fd2227	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.467991+00	2025-08-18 02:55:15.467991+00	\N
43aac224-d9db-4335-9186-0623a4497944	(303) 139-3716	10341	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	52960a86-cfc0-476b-b93a-eac715fd2227	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.471789+00	2025-08-18 02:55:15.471789+00	\N
db6b95e7-0523-415c-96c5-54bb610aca70	(305) 229-2036	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	a40ac272-8ac6-455e-8d84-bd776c8a067e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.48949+00	2025-08-18 02:55:15.48949+00	\N
887edcde-4adc-45b3-ba2a-74b231f22448	(713) 670-1816	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2e9b5160-e260-4461-86ca-0febd7a1f096	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.238919+00	2025-08-17 13:44:23.238919+00	\N
01ffbc9c-bd4e-4783-ab0a-7794bbc85ead	(305) 859-9005	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	a40ac272-8ac6-455e-8d84-bd776c8a067e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.491908+00	2025-08-18 02:55:15.491908+00	\N
9dd986ef-9649-4bbc-a61b-01a68c6a22df	(617) 772-9951	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b27f9347-98a5-4539-a8a3-cec91d478d58	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.510064+00	2025-08-18 02:55:15.510064+00	\N
c8572177-4118-4b6b-a778-de82526e2e01	(617) 659-9222	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	c685caad-fbcd-419d-986d-0511ef70225a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.253752+00	2025-08-17 13:44:23.253752+00	\N
1767f622-494e-41c1-ae9f-74fadb10870a	(214) 677-2223	8091	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	c685caad-fbcd-419d-986d-0511ef70225a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.256224+00	2025-08-17 13:44:23.256224+00	\N
6cff3b3e-c4dc-48dc-97f8-96c874bbde64	(415) 174-2521	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2ee58325-4cf0-4ccb-99a2-4d2259a7c52a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.527141+00	2025-08-18 02:55:15.527141+00	\N
c287f8d8-d50d-4976-af8b-23bb4645f8fe	(305) 857-7299	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	2ee58325-4cf0-4ccb-99a2-4d2259a7c52a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.529398+00	2025-08-18 02:55:15.529398+00	\N
171c3e71-b9eb-453e-ac59-d23090a34297	(305) 806-3202	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	0eb4c92d-9868-4774-9318-f87dce8e1ce1	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.541422+00	2025-08-18 02:55:15.541422+00	\N
c8cc5316-052c-432a-a8dc-8c5816a95e4e	(206) 332-7329	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	a65d6716-0816-480b-a6a6-77b4b62f9330	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.55899+00	2025-08-18 02:55:15.55899+00	\N
cbbce73e-99f9-494b-a946-5f3a6aef40c7	(214) 942-6964	4669	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	a65d6716-0816-480b-a6a6-77b4b62f9330	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.561214+00	2025-08-18 02:55:15.561214+00	\N
84f05180-4cd7-4826-9d51-d62f7bfa39a3	(214) 997-8204	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	a65d6716-0816-480b-a6a6-77b4b62f9330	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.563318+00	2025-08-18 02:55:15.563318+00	\N
a3e9a23a-ea73-4476-b278-9e0079610caa	(312) 800-1479	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	367e6934-6b67-497f-888a-53155fa4fbc8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.582709+00	2025-08-18 02:55:15.582709+00	\N
f266d825-0126-4efd-ba72-270c0727c66d	(404) 238-6752	2149	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	367e6934-6b67-497f-888a-53155fa4fbc8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.586605+00	2025-08-18 02:55:15.586605+00	\N
9020e02d-6f3e-4dd7-b8a9-d26c10d1ec1c	(602) 190-5961	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2c88a6c9-6f3b-4fd8-86fa-fd0581c2dcb2	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.603671+00	2025-08-18 02:55:15.603671+00	\N
01f0db3c-a72e-449e-bd35-21f2b9fbc393	(312) 614-8095	6220	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	2c88a6c9-6f3b-4fd8-86fa-fd0581c2dcb2	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.606842+00	2025-08-18 02:55:15.606842+00	\N
34034c46-0ff0-482c-84db-a111dd7224f1	(713) 507-4005	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	ceb3f035-6384-4650-b385-02b8c704f477	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.622611+00	2025-08-18 02:55:15.622611+00	\N
c66249f2-1d0a-40f0-a37f-4ddc726a9a35	(212) 126-6321	5965	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	ceb3f035-6384-4650-b385-02b8c704f477	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.624901+00	2025-08-18 02:55:15.624901+00	\N
73f5c51d-708c-412b-9e8e-bae13b76c100	(303) 886-2513	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	0a518a68-b89c-4e08-aee0-c05334e7dc57	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.641712+00	2025-08-18 02:55:15.641712+00	\N
4ba508a4-5eac-4660-9adb-72fbaab0f06d	(713) 407-7674	6734	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	0a518a68-b89c-4e08-aee0-c05334e7dc57	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.6436+00	2025-08-18 02:55:15.6436+00	\N
de568e62-42aa-4581-9695-85953a7d525e	(617) 325-1865	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b19ac50e-e030-41bb-9671-53b1dd331a30	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.653015+00	2025-08-18 02:55:15.653015+00	\N
3667e3e6-8e26-47ed-aa94-634b18cd7b53	(312) 422-6898	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	673e3787-b9d3-4f29-8c99-47bd4288c0ae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.333054+00	2025-08-17 13:44:23.333054+00	\N
9505b43a-eb22-43ff-9126-5b78cea818eb	(312) 486-4787	8791	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	673e3787-b9d3-4f29-8c99-47bd4288c0ae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.334942+00	2025-08-17 13:44:23.334942+00	\N
6b614d1b-6e6e-4950-8db8-0296531a9dde	(404) 746-9360	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f73af282-1e7c-4aff-a1f8-00cb2ac85f75	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.341587+00	2025-08-17 13:44:23.341587+00	\N
1f39c1b6-5c78-4087-9efe-6940fff6cb59	(404) 916-7415	1049	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	f73af282-1e7c-4aff-a1f8-00cb2ac85f75	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.343507+00	2025-08-17 13:44:23.343507+00	\N
7b96339d-72b3-43ab-a9e3-79075c02c23c	(415) 826-4434	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	89c62806-64bb-4f75-9a89-db2e53ba0e3d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.347614+00	2025-08-17 13:44:23.347614+00	\N
ffd97db9-cbb3-4886-8420-81a40ad2adb4	(713) 872-9518	10388	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	89c62806-64bb-4f75-9a89-db2e53ba0e3d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.349331+00	2025-08-17 13:44:23.349331+00	\N
242a33d6-5bd7-4f9d-88ac-8f3b28033cb1	(214) 329-9772	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	64a602ac-e866-4ed9-a2dc-ceca1c817857	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.356126+00	2025-08-17 13:44:23.356126+00	\N
fd85ea6d-889c-4683-97f7-a394049b17b5	(404) 942-9444	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	a44420fd-7110-4dad-9da9-ca2b193f3b2d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.362501+00	2025-08-17 13:44:23.362501+00	\N
019f72ba-bcb9-4e74-a5bf-5b5c723cdea3	(305) 258-5969	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	bb9580c7-23e9-46fb-855f-a941a7bfee44	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.366647+00	2025-08-17 13:44:23.366647+00	\N
e928912c-d270-401c-a155-6ff72f1ff662	(214) 229-3626	2914	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	bb9580c7-23e9-46fb-855f-a941a7bfee44	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.36848+00	2025-08-17 13:44:23.36848+00	\N
afa879d7-b5be-4b6f-97b3-d6030efa5d7d	(602) 342-2361	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	c218f25f-f12c-4bd6-ba47-5ceac93febcf	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.373685+00	2025-08-17 13:44:23.373685+00	\N
4b6b5388-31f7-451c-9c6f-83e04ef1bc65	(617) 225-1887	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	9eabb160-fca8-406b-89ac-0b3176ae679c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.380295+00	2025-08-17 13:44:23.380295+00	\N
2e46cd35-6cab-49df-829d-dceaac11bd71	(713) 558-9885	9357	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	9eabb160-fca8-406b-89ac-0b3176ae679c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.3821+00	2025-08-17 13:44:23.3821+00	\N
949e03f9-24b8-4f99-abc8-35809863854f	(713) 129-1929	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	8330bd5c-2c78-499a-8271-070ce50b33ca	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.388783+00	2025-08-17 13:44:23.388783+00	\N
53ab5279-e8ab-4637-84fa-466ddd762c60	(312) 650-8856	7059	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	8330bd5c-2c78-499a-8271-070ce50b33ca	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.391305+00	2025-08-17 13:44:23.391305+00	\N
3d2124fa-ff40-45fd-9a3e-bdbbf88b2421	(312) 907-2564	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	1d09275b-feab-48d0-b599-68db8a516674	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.399155+00	2025-08-17 13:44:23.399155+00	\N
90414cdb-b4d0-4309-88a9-82b2e9e4161d	(312) 131-2463	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	e403d4a2-31b4-4d06-819a-08f3f0967020	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.403489+00	2025-08-17 13:44:23.403489+00	\N
679669ea-48db-4575-9da2-35e4b8547207	(617) 331-4436	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	27f6e5ec-817d-4ad2-afba-d3e1b10e5b3f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.409333+00	2025-08-17 13:44:23.409333+00	\N
e9d4fd95-1d07-4910-8807-71caf070a2a3	(212) 336-1256	5036	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	27f6e5ec-817d-4ad2-afba-d3e1b10e5b3f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.41121+00	2025-08-17 13:44:23.41121+00	\N
533473d3-6173-4933-b28e-6c6fd4e06a5e	(617) 856-5127	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	0919ca3b-5414-4387-80b4-b53d278ab1e9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.417283+00	2025-08-17 13:44:23.417283+00	\N
8d62cd4a-cf1c-4e2a-8342-36940112212e	(312) 378-7799	5885	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	0919ca3b-5414-4387-80b4-b53d278ab1e9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.419206+00	2025-08-17 13:44:23.419206+00	\N
8e979b01-b56c-4055-91ca-a43364ce9b6f	(212) 140-5000	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2ccfbd5b-2ff9-4172-8a30-a3fff5710238	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.424447+00	2025-08-17 13:44:23.424447+00	\N
4d85c1f0-c88e-4f90-9f61-2c06b639a990	(206) 939-9078	7427	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	2ccfbd5b-2ff9-4172-8a30-a3fff5710238	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.426639+00	2025-08-17 13:44:23.426639+00	\N
037f9c39-69ab-4034-bd79-28f9f4300bce	(404) 335-4413	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	47efeca3-a40e-4f19-baee-83b8c2ce8efc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.430748+00	2025-08-17 13:44:23.430748+00	\N
b738ba6b-7895-48f8-ac09-42b9dedc7390	(212) 261-1609	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f0dff0ba-f719-4f96-8616-af6590d75401	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.435508+00	2025-08-17 13:44:23.435508+00	\N
2ccceeae-1980-4e36-8270-57b8b67989ec	(713) 742-8804	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b754692c-7ebe-4721-8c4d-d79d0c9c4410	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.44319+00	2025-08-17 13:44:23.44319+00	\N
af65ebad-654b-457c-9fe9-9dd28555e2f0	(212) 694-9598	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	c2a5e03b-3c79-4a89-b735-f4e5b37ca0da	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.449188+00	2025-08-17 13:44:23.449188+00	\N
6e0241a3-7582-45d9-a2cc-fcd2ea48da3f	(404) 529-8442	8265	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	c2a5e03b-3c79-4a89-b735-f4e5b37ca0da	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.451116+00	2025-08-17 13:44:23.451116+00	\N
00ef786e-3ee1-4529-81b0-19b983ef8e43	(404) 142-2654	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	345de5af-b5ec-4596-ac21-f0b7ea4e25ad	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.459625+00	2025-08-17 13:44:23.459625+00	\N
b429dbba-8eaf-412c-a696-2ce48bcc020f	(404) 263-2484	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2604602e-b45e-46ce-beb2-889a80004c15	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.46564+00	2025-08-17 13:44:23.46564+00	\N
00510109-0cf5-4de3-bfd6-f821b351c8fd	(312) 370-2770	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	46329ca7-07e6-4e20-ae38-de578a8a17ec	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.474398+00	2025-08-17 13:44:23.474398+00	\N
58a36ce1-cd6e-4fbb-9b42-4e92db2f0bca	(212) 793-4400	4215	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	46329ca7-07e6-4e20-ae38-de578a8a17ec	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.4763+00	2025-08-17 13:44:23.4763+00	\N
9be44708-f107-45bc-ae5f-5733cda42d89	(303) 757-5754	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	81d7b663-6309-4c6a-9b15-df2116603e7c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.480578+00	2025-08-17 13:44:23.480578+00	\N
49f34191-b17f-4d24-a2b8-9278898d9a27	(617) 334-7039	9402	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	81d7b663-6309-4c6a-9b15-df2116603e7c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.482298+00	2025-08-17 13:44:23.482298+00	\N
0b23c1e0-5e78-4958-8646-39d926394aaf	(303) 219-1962	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2f1441fd-04b9-4d61-bcb0-b9e70e01d17a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.487732+00	2025-08-17 13:44:23.487732+00	\N
3e922668-77da-4711-a2f7-343c09533c52	(303) 133-1990	1443	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	2f1441fd-04b9-4d61-bcb0-b9e70e01d17a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.490161+00	2025-08-17 13:44:23.490161+00	\N
3fa6fe10-d737-49d9-8261-d1fcad57bb93	(214) 498-9816	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2d009c16-2efc-4aff-969b-3ffdcd889455	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.495081+00	2025-08-17 13:44:23.495081+00	\N
c650d238-ee00-4251-aa8e-3e98e4e97600	(713) 684-5743	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b16af43d-4eca-42ae-88d0-b226bc972b45	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.50088+00	2025-08-17 13:44:23.50088+00	\N
0e4a504b-7714-41ae-a97d-9671586acf9b	(214) 901-7611	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	bf1250e4-f880-49cf-8922-c58160f1c54a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.508889+00	2025-08-17 13:44:23.508889+00	\N
ac883506-8c9f-4319-9683-3bda14cb78bd	(713) 306-3467	10772	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	bf1250e4-f880-49cf-8922-c58160f1c54a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.510903+00	2025-08-17 13:44:23.510903+00	\N
7879c461-2a4f-4f7e-882c-f9c4bd75e622	(404) 132-2958	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	3d217f34-7bf3-495e-a7cf-c5b86460e720	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.516805+00	2025-08-17 13:44:23.516805+00	\N
7160245b-1e98-47e8-a790-71a73eeac048	(404) 905-2758	3024	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	3d217f34-7bf3-495e-a7cf-c5b86460e720	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.518563+00	2025-08-17 13:44:23.518563+00	\N
9d2eab55-93d3-4ff6-9164-6fa0ec03a7ff	(206) 492-7027	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	487a22b0-19c8-4cce-82bf-b3aba6d573b4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.526612+00	2025-08-17 13:44:23.526612+00	\N
daa1589b-0b21-480b-bf93-b4a86e49d86f	(312) 878-5630	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	3c776a84-690f-49b4-9b92-a7b0b05bf02c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.532951+00	2025-08-17 13:44:23.532951+00	\N
cd588532-3bd1-422a-967f-fdae82c22c2c	(404) 740-1350	5110	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	3c776a84-690f-49b4-9b92-a7b0b05bf02c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.535878+00	2025-08-17 13:44:23.535878+00	\N
4078065d-99be-4414-8517-63b255c07899	(212) 267-2844	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	048fb772-8d84-4a5a-a041-b53e813ad11d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.54456+00	2025-08-17 13:44:23.54456+00	\N
7fdbac50-c179-4ce7-9acf-6500f6a234bd	(404) 955-1944	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	817f740e-6756-43f8-b62c-546be5e1264f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.548786+00	2025-08-17 13:44:23.548786+00	\N
eecb60bb-c1c0-4c9c-b53d-a4636ff227db	(305) 747-4816	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	1651b848-eaf2-45e4-9c8a-b86f5d9cf9b9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.553468+00	2025-08-17 13:44:23.553468+00	\N
fdf14259-956c-40bc-bbe7-1a2ea18dd319	(303) 290-4645	6860	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	1651b848-eaf2-45e4-9c8a-b86f5d9cf9b9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.55722+00	2025-08-17 13:44:23.55722+00	\N
bdbf0920-9a9f-4354-b20f-c185337d3206	(303) 177-5585	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	b19ac50e-e030-41bb-9671-53b1dd331a30	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.654944+00	2025-08-18 02:55:15.654944+00	\N
eefe2063-33b6-4fc9-89c3-3bd6f2d6107e	(206) 901-1976	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	01b05834-bb0d-43c8-b4da-ed27dbd912a9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.671488+00	2025-08-18 02:55:15.671488+00	\N
149b70ba-3fed-4cbf-973d-2bdd8b16cd75	(305) 591-5711	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b71ee491-3ce5-454b-ac30-52a257a6545a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.571558+00	2025-08-17 13:44:23.571558+00	\N
c82423f1-c777-47a5-96ae-68276c5bd2d0	(617) 460-8021	6327	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	01b05834-bb0d-43c8-b4da-ed27dbd912a9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.674349+00	2025-08-18 02:55:15.674349+00	\N
221a00f8-4401-46b2-b380-26e17361b3b6	(312) 962-2822	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	01b05834-bb0d-43c8-b4da-ed27dbd912a9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.67735+00	2025-08-18 02:55:15.67735+00	\N
5c9f6804-328c-4edc-9bdd-83c820af0c4b	(305) 955-1019	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	e1e0af9b-b354-492c-ad7a-1eac6822b94f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.684719+00	2025-08-18 02:55:15.684719+00	\N
90228fae-36b7-45ba-8eb5-07044b69c62d	(404) 166-5922	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	e1e0af9b-b354-492c-ad7a-1eac6822b94f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.686508+00	2025-08-18 02:55:15.686508+00	\N
e26854f8-fb0e-466c-8356-fa73b01297a9	(415) 855-5996	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	3ae8ea21-9bbb-4793-a817-4400d1e0bbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.591675+00	2025-08-17 13:44:23.591675+00	\N
961a1218-f870-4ffe-a444-57898197926a	(206) 321-9594	10147	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	3ae8ea21-9bbb-4793-a817-4400d1e0bbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.593748+00	2025-08-17 13:44:23.593748+00	\N
bb540301-3735-486f-93ad-d04c39e07001	(212) 860-6361	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	120b214a-074b-4a9a-9fc5-ca36d2a2f9b3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.699322+00	2025-08-18 02:55:15.699322+00	\N
d184b2bc-2b71-4afa-94fe-841ec38fc248	(214) 151-5446	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f62f2ffe-bc11-4ad4-aa1e-394c378a0961	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.708505+00	2025-08-18 02:55:15.708505+00	\N
8a13205d-a67a-49e8-88db-1366f3648f5b	(212) 397-5676	3620	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	f62f2ffe-bc11-4ad4-aa1e-394c378a0961	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.711148+00	2025-08-18 02:55:15.711148+00	\N
b58ccd65-c9a1-42a6-9d82-cd4644a9e628	(305) 893-1920	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	376ca675-1847-46a9-bca9-e44389fa2b37	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.720358+00	2025-08-18 02:55:15.720358+00	\N
1c553b6e-c57c-45d2-888d-1089d1076e3e	(713) 977-3981	3374	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	376ca675-1847-46a9-bca9-e44389fa2b37	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.722453+00	2025-08-18 02:55:15.722453+00	\N
2fbbb9eb-0693-41b1-b1f5-318cfa364986	(303) 826-3162	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	e4206740-6e12-438a-88c0-20d34a77d92a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.624999+00	2025-08-17 13:44:23.624999+00	\N
858c2e3b-1c60-4476-9fe8-9dd4f9b4abb8	(415) 908-2541	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f6fba39d-6836-4bae-9510-36e23bb12d7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.733738+00	2025-08-18 02:55:15.733738+00	\N
8588d225-d0de-4dd1-b204-d223e853781f	(206) 332-3927	2767	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	f6fba39d-6836-4bae-9510-36e23bb12d7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.735765+00	2025-08-18 02:55:15.735765+00	\N
1379a2e1-c45e-46d2-af2e-8f04a5ce4943	(305) 569-8960	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	97b27d1b-a376-4804-a447-ecd4dd1cda7f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.746472+00	2025-08-18 02:55:15.746472+00	\N
8c0afb7a-b380-4599-bfef-20d52d6819cb	(713) 584-2727	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	bd856c40-6e97-4f86-a3b9-7aba2618a39c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.758566+00	2025-08-18 02:55:15.758566+00	\N
6a3efb25-94ae-4ace-9fa5-525ba853e0f3	(713) 806-7824	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	9701b59a-e8b6-4eec-b8d6-e717727e350f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.651827+00	2025-08-17 13:44:23.651827+00	\N
567518ee-d240-4c95-bd8a-e23040fa6d10	(602) 939-8074	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	546079f5-23d1-4df5-bfa5-2f99cd73a3bc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.658027+00	2025-08-17 13:44:23.658027+00	\N
bfa2e650-6d39-470e-b70a-0a75a64d0c1a	(305) 453-5009	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	2a4ec289-cd62-496d-9635-e0b2959234c9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.769016+00	2025-08-18 02:55:15.769016+00	\N
3991d52f-970c-454d-8a02-cd298400230f	(617) 237-9247	10839	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	2a4ec289-cd62-496d-9635-e0b2959234c9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.770782+00	2025-08-18 02:55:15.770782+00	\N
68a1fb1b-6508-4e58-ae36-c93e4e208e54	(214) 679-5122	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	2a4ec289-cd62-496d-9635-e0b2959234c9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.772786+00	2025-08-18 02:55:15.772786+00	\N
f8ccf54d-4a25-4f89-b2ba-08718d6d5fb3	(602) 372-4378	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	a3359bff-5b5f-4e0a-a8fc-d5b45b3a0024	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.781227+00	2025-08-18 02:55:15.781227+00	\N
4f4447bb-f4f2-41d5-8cb5-6733ef01890c	(415) 727-9971	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	0c444676-f5e5-4275-b438-caff065b3d22	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.791365+00	2025-08-18 02:55:15.791365+00	\N
86242951-f6dd-4b36-920c-fb7acdfefad0	(415) 926-9606	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	4f586d8f-4b05-4bb9-8b3a-70ccaccfefd6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.809411+00	2025-08-18 02:55:15.809411+00	\N
1ab4bc0e-3d02-4b9b-9281-2069d32b0bd9	(305) 492-7100	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	108648cc-0f9b-460f-b395-45866ff4d812	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.692616+00	2025-08-17 13:44:23.692616+00	\N
7243b7d9-1092-40bb-86e8-78d645cfed6f	(206) 267-9302	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	4f586d8f-4b05-4bb9-8b3a-70ccaccfefd6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.811095+00	2025-08-18 02:55:15.811095+00	\N
ba12d2ab-774b-4181-81ef-c1ed37ee01b6	(206) 987-3578	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b2eba624-0dd1-4178-964d-837b6959c1a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.823552+00	2025-08-18 02:55:15.823552+00	\N
edf86597-019b-459a-9604-e271df1710a5	(312) 544-1097	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	e85bbb6e-f89c-4248-a41f-25fe355019de	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.706753+00	2025-08-17 13:44:23.706753+00	\N
97d1dfef-f152-4f5a-9b2c-a0fa4a336164	(303) 602-6556	8328	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	e85bbb6e-f89c-4248-a41f-25fe355019de	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 13:44:23.709196+00	2025-08-17 13:44:23.709196+00	\N
aba99486-0ac6-4db9-b0cb-f5030cb40a52	(312) 869-2696	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	cd4a1698-ccc4-4e51-b67d-0359d996f47e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.836201+00	2025-08-18 02:55:15.836201+00	\N
cdc74630-7da6-440c-93e4-c556ec8a67ca	(415) 397-3788	7226	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	cd4a1698-ccc4-4e51-b67d-0359d996f47e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.83801+00	2025-08-18 02:55:15.83801+00	\N
f7ad3711-b909-40c4-8075-0cabc2f8e482	(305) 435-3250	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	cd4a1698-ccc4-4e51-b67d-0359d996f47e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.840001+00	2025-08-18 02:55:15.840001+00	\N
53d9d6b7-cb2d-401f-b720-ada7218be527	+1 226-177-9505	\N	t	\N	b5d95210-8c01-4eb2-bec2-ced705e9c90a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:33.327023+00	2025-08-17 14:50:33.327023+00	\N
a596b702-552b-4da8-977f-5e44c4822c40	+1 141-739-9205	\N	t	\N	923d50f0-1533-41b8-af8d-c1a8eb65212b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:33.461415+00	2025-08-17 14:50:33.461415+00	\N
7db2466c-f613-4091-8062-3dc76a6b213b	+1 823-327-5206	\N	t	\N	fd6b2fcf-5ae6-42a9-8d02-4a1cbf9b9e70	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:33.600223+00	2025-08-17 14:50:33.600223+00	\N
de35b503-1a91-4ea2-a93e-faac3aeaa4c2	+1 322-198-8161	\N	t	\N	5591d830-f231-4277-a277-3d76bb56fda4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:33.735954+00	2025-08-17 14:50:33.735954+00	\N
d39a9485-c616-476b-953c-747d13432cdb	+1 122-138-7149	\N	t	\N	af70e48c-e93a-4931-8158-46b6e2897ddc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:33.870367+00	2025-08-17 14:50:33.870367+00	\N
0c51ffdd-d905-4a81-be36-87faf8362941	+1 804-878-2224	\N	t	\N	9ddc27e3-c6b8-4a48-96dd-134a6750b48c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:34.006074+00	2025-08-17 14:50:34.006074+00	\N
5c7bceff-8bd7-45f4-946f-e9c82355ecf5	+1 586-754-3268	\N	t	\N	68e3ca4e-3c35-4236-ab30-c36fd6c4df7e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:34.139002+00	2025-08-17 14:50:34.139002+00	\N
834535f4-c9fe-45f8-88cf-be50afcc01e2	+1 668-548-7405	\N	t	\N	ac627c24-26bd-4153-8de0-03b2ee5e74bc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:34.273531+00	2025-08-17 14:50:34.273531+00	\N
56bbecb4-8fd0-4203-adb0-b109e2d9c125	+1 322-551-6810	\N	t	\N	06d0ccfe-781d-4187-9a23-19641e6f10e2	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:34.407865+00	2025-08-17 14:50:34.407865+00	\N
c1f0e7c8-a4c6-4b9e-989f-98409646f0e9	+1 512-245-1397	\N	t	\N	20d6a06f-e74b-420d-b563-8f76414a5eaf	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:34.542521+00	2025-08-17 14:50:34.542521+00	\N
2cf94563-37f1-45ba-895d-1a362b2802c7	+1 485-102-3366	\N	t	\N	b682efe6-31da-4566-8de1-f50acba3ebf3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:34.675411+00	2025-08-17 14:50:34.675411+00	\N
a264819c-382b-4879-87af-08e0298a222f	+1 875-140-6082	\N	t	\N	99102125-6daa-43ba-9cff-9b0491cc0b38	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:34.81013+00	2025-08-17 14:50:34.81013+00	\N
28780e27-029c-4c7e-94c4-9250f11e07fd	+1 631-793-1928	\N	t	\N	2d4cc63f-2396-48d9-81cd-01e7f59f6bec	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:34.945735+00	2025-08-17 14:50:34.945735+00	\N
43603c9c-7ae5-4b6f-975b-2750c356916d	+1 423-530-5749	\N	t	\N	0fb2521b-2d80-42da-bbfb-625601e9d72f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:35.080707+00	2025-08-17 14:50:35.080707+00	\N
7aa1fcc4-e5a1-436a-a9ff-b795737a660e	+1 795-978-1605	\N	t	\N	b6a53116-3265-4a29-a01a-96bef1b8cf89	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:35.216385+00	2025-08-17 14:50:35.216385+00	\N
88b00be8-f7e0-4d67-8e08-58966c8e8764	+1 548-648-8004	\N	t	\N	5e530eda-fdaa-4aa4-9871-97252dccc966	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:35.360456+00	2025-08-17 14:50:35.360456+00	\N
462d5fda-9467-4d17-86d4-e60957176f42	+1 518-398-3579	\N	t	\N	fd2a737d-bcde-46c8-8fc1-d8fa20bff3f0	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:35.494298+00	2025-08-17 14:50:35.494298+00	\N
383cb66f-d71e-4404-a878-3c586e017d8f	+1 709-952-4028	\N	t	\N	e68d1e20-84fd-4564-a757-fe3f272e43fa	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:35.629066+00	2025-08-17 14:50:35.629066+00	\N
e015c97f-5fed-46b0-ba56-9b6caedc3f5e	+1 442-402-9970	\N	t	\N	8a7daa72-e559-4426-afd1-3eee65a6ec99	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:35.761015+00	2025-08-17 14:50:35.761015+00	\N
6a857e5a-0d0a-4d67-bb85-287f48deaaa1	+1 628-219-8085	\N	t	\N	f6a1f81b-e0b6-4d7f-a39b-0b9d701b5006	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:35.895607+00	2025-08-17 14:50:35.895607+00	\N
f777c8b4-8de0-4b1c-b486-6da616c6d681	+1 790-477-7829	\N	t	\N	893ee0ec-c718-497d-89bd-a98a21a30163	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:36.034954+00	2025-08-17 14:50:36.034954+00	\N
6c234af3-2b33-41b9-a765-02833e7e1166	+1 522-535-9069	\N	t	\N	d320e4e0-9e0f-4eaf-b97e-4ab85851873e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:36.173749+00	2025-08-17 14:50:36.173749+00	\N
e9314a02-6277-40bd-acc4-99b8a11dcd50	+1 811-172-1849	\N	t	\N	b74b2fe6-38d2-4154-b6ca-007acd6bdb58	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:36.314027+00	2025-08-17 14:50:36.314027+00	\N
5e2c73f1-2713-4ae0-ba24-d5eaf97636da	+1 265-503-8002	\N	t	\N	cbb6f458-1c3d-4a48-afc5-799bbcca4671	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:36.452578+00	2025-08-17 14:50:36.452578+00	\N
d5357523-4bd9-489e-8da6-4e656b37fdbf	+1 429-425-2441	\N	t	\N	9486dee5-bc02-4d1d-b12b-f3e48d5eb10a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:36.592729+00	2025-08-17 14:50:36.592729+00	\N
627fbe70-c87d-4917-9f70-ff4fd677c731	+1 351-231-8671	\N	t	\N	a1741766-bcc5-45aa-8381-f9492d35f90d	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:36.737788+00	2025-08-17 14:50:36.737788+00	\N
688b36ca-bf22-4218-9202-1f51c914e5a8	+1 111-734-5581	\N	t	\N	4f42bc46-27e6-43c7-8926-b06468656b34	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:36.873338+00	2025-08-17 14:50:36.873338+00	\N
ad59d293-9481-489f-83bd-cccd473e811d	+1 457-602-1984	\N	t	\N	e20382b4-fca4-4077-8b46-371051520383	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:37.028301+00	2025-08-17 14:50:37.028301+00	\N
bdd2da39-ceac-4672-9959-a88103d6afe9	+1 848-165-8188	\N	t	\N	367924b0-7eec-4b7c-8f17-13d0917dde8e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:37.181015+00	2025-08-17 14:50:37.181015+00	\N
778ba359-32ee-465f-8958-178fe8f847bd	+1 553-170-9239	\N	t	\N	a48a2ac3-5ae2-4705-9a1f-b0a7ff153333	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:37.332773+00	2025-08-17 14:50:37.332773+00	\N
a552d77d-8891-4cd4-9098-47d571d016b3	+1 794-718-2098	\N	t	\N	7cd47f9d-7f2d-4765-86f2-b15b48ebb899	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:37.478493+00	2025-08-17 14:50:37.478493+00	\N
4027103e-6070-4b43-bfb6-910dc63b708c	+1 425-503-6907	\N	t	\N	70b3a0a7-cbb0-4f1f-a290-e88b67dc5c7f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:37.653605+00	2025-08-17 14:50:37.653605+00	\N
a68a2d8a-cb37-4994-8911-877055929ab2	+1 139-314-7516	\N	t	\N	5b34b9e3-c6e1-4172-96de-077be7ef499f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:37.806527+00	2025-08-17 14:50:37.806527+00	\N
407fc959-ae1e-4c40-a59b-3d9feeeb7343	+1 674-471-2627	\N	t	\N	55624910-09e2-4469-b63f-e1263eac2186	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:37.957948+00	2025-08-17 14:50:37.957948+00	\N
6a65aca5-0853-4716-affb-e43117300d98	+1 194-621-1977	\N	t	\N	93ff41f7-db8a-41d6-b4cf-bac491a97e4c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:38.113212+00	2025-08-17 14:50:38.113212+00	\N
5e1b896f-3414-4057-9640-d5652da97677	+1 493-436-9307	\N	t	\N	1df24149-8a82-4f17-b240-4d8021bd9a35	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:38.266523+00	2025-08-17 14:50:38.266523+00	\N
018d49ea-9913-441d-87d9-afec0c0daf19	+1 185-203-2906	\N	t	\N	8fd7a0ba-5385-4542-b9fb-783cec2ad609	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:38.416941+00	2025-08-17 14:50:38.416941+00	\N
91f9554b-74e5-4ba9-9696-ed226e9f0aa5	+1 993-664-4265	\N	t	\N	d1f54120-9910-4443-9c07-3f9d25346855	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:38.560057+00	2025-08-17 14:50:38.560057+00	\N
a6c4edd8-6cca-484f-b89d-43c2dbbf9a74	+1 385-764-2811	\N	t	\N	9bb2f1cd-9dbb-4ee8-9c30-bd18aa95d6a6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:38.704556+00	2025-08-17 14:50:38.704556+00	\N
bbc891c4-5f9a-41d0-80f7-0053e1b5219e	+1 977-923-6236	\N	t	\N	dc42dff5-df03-483f-b42f-620450d5c955	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:38.942231+00	2025-08-17 14:50:38.942231+00	\N
95a9b5b0-9a3b-404c-8978-89110d987af7	+1 253-750-5750	\N	t	\N	521f72e2-c737-46aa-a0e1-4510aebff95b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:39.174862+00	2025-08-17 14:50:39.174862+00	\N
433565bf-e259-4047-af69-5ad1166b6e74	+1 159-463-6999	\N	t	\N	0e85ece1-089a-4c4e-b98d-ca04a42c05b3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:39.412096+00	2025-08-17 14:50:39.412096+00	\N
77f99ef4-51df-4be0-b3ff-6730de82eb8c	+1 101-449-4858	\N	t	\N	94b6ee70-b56b-48b7-bba6-af3d7bc4e6b9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:39.590835+00	2025-08-17 14:50:39.590835+00	\N
edc87d0d-68cc-434d-9125-83f99b7083eb	+1 898-274-9551	\N	t	\N	bcb6a848-02e9-4338-a9c6-0f3f4cb92714	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:39.923765+00	2025-08-17 14:50:39.923765+00	\N
6b8a3ec9-5ea1-45ac-a39b-538a3f9f5c76	+1 403-281-6716	\N	t	\N	686e2af8-b08c-412c-b26f-83bdfb00c042	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:40.325303+00	2025-08-17 14:50:40.325303+00	\N
2bd602be-4ecd-4e79-835d-e16c047bfdd4	+1 336-975-8446	\N	t	\N	3db982a1-3b4a-4fe4-bf47-ac68037b5a49	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:40.474872+00	2025-08-17 14:50:40.474872+00	\N
4c393a9f-89ff-4682-80b2-f4795cb36e4a	+1 281-940-6899	\N	t	\N	e76c2a1a-4d6a-4011-bb66-28f982b368a3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:40.617714+00	2025-08-17 14:50:40.617714+00	\N
4ec0bf93-a42d-4655-ae7c-2c6a1bfc8602	+1 564-775-1479	\N	t	\N	34ad8b95-788e-49da-9e60-a5105158484a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:40.759935+00	2025-08-17 14:50:40.759935+00	\N
54b237c9-ea07-4abf-b417-a05958bfbed5	+1 218-106-3972	\N	t	\N	1d1f1be9-828c-474b-84b7-c7603dc19273	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:40.896859+00	2025-08-17 14:50:40.896859+00	\N
10250759-e8b2-4676-9f55-193bc3ca0493	+1 978-105-8385	\N	t	\N	a9a5d69b-ac39-4d6b-8c6c-a94949a9c3b6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 14:50:41.036821+00	2025-08-17 14:50:41.036821+00	\N
9afe060a-50bf-4f1e-afe4-4682ac11730e	(212) 371-2482	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	b9f04d97-3de9-4904-abfc-02da289b36c3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.575174+00	2025-08-17 16:27:08.575174+00	\N
cced8a92-f8be-40b0-9f20-b4333f29aa68	(212) 804-1871	6390	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	b9f04d97-3de9-4904-abfc-02da289b36c3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.57731+00	2025-08-17 16:27:08.57731+00	\N
4aa48a36-7ed5-47ca-b72e-199ef7040eee	(602) 393-1285	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	b9f04d97-3de9-4904-abfc-02da289b36c3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.579521+00	2025-08-17 16:27:08.579521+00	\N
d9c6d624-3dd1-4085-ba60-95d9765c2759	(602) 345-3564	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f3b9674b-6d74-44fc-8e45-d211e690bbbe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.658043+00	2025-08-17 16:27:08.658043+00	\N
1e47b94e-5bee-48c4-872a-9bc937411aca	(602) 779-4421	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	cb7bd4d2-dd4f-4f3e-ac59-0a62a347c699	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.682681+00	2025-08-17 16:27:08.682681+00	\N
4c35319b-4e8e-40e1-b44c-ba3207c5db5b	(206) 318-2350	1338	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	cb7bd4d2-dd4f-4f3e-ac59-0a62a347c699	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.684407+00	2025-08-17 16:27:08.684407+00	\N
4aa1ece3-4ae8-446e-81e9-fab970e120c0	(312) 787-8063	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	4ca5e3bb-818b-4ea2-bdc4-302ba84030dd	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.878452+00	2025-08-17 16:27:08.878452+00	\N
73b5b9f8-dfb0-41da-a912-6b270cb99b9c	(415) 662-8839	1568	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	4ca5e3bb-818b-4ea2-bdc4-302ba84030dd	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.880825+00	2025-08-17 16:27:08.880825+00	\N
afbc234a-8010-4c41-9cb4-d95d5d3427d1	(602) 700-4913	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	4ca5e3bb-818b-4ea2-bdc4-302ba84030dd	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.884057+00	2025-08-17 16:27:08.884057+00	\N
a26a5e55-0f90-44e0-9828-d6b46fe814d3	(312) 418-3969	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	29785965-f1d8-404b-b676-66eb57674d18	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.903976+00	2025-08-17 16:27:08.903976+00	\N
ea35fe84-b07f-4f16-87fe-0a91911e75d4	(713) 464-4972	5726	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	29785965-f1d8-404b-b676-66eb57674d18	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.905951+00	2025-08-17 16:27:08.905951+00	\N
db7db9da-9e1a-4284-9916-29d884bc82cd	(713) 824-3209	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	1c682b6d-deb0-4f45-b6f5-7fa15e022d6a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.918906+00	2025-08-17 16:27:08.918906+00	\N
1da8d0b1-cf0c-4987-975d-c92020a73c42	(404) 736-1818	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	1c682b6d-deb0-4f45-b6f5-7fa15e022d6a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.921952+00	2025-08-17 16:27:08.921952+00	\N
7928f558-801e-42e5-97ce-0bda17783a5f	(212) 762-5674	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	d8447d3f-b609-4082-8465-a011f51df931	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.937145+00	2025-08-17 16:27:08.937145+00	\N
76aa6dff-94aa-443a-a17b-da06f7e18b7d	(602) 116-5335	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	930ee9a5-7dc6-4c0e-aaa2-2ff6e58600a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.955838+00	2025-08-17 16:27:08.955838+00	\N
bb4a95ee-9bb2-47e8-972c-888877eba755	(305) 143-2101	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f980c170-c4ff-43bc-8a6e-1ffccdfc71e7	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.970497+00	2025-08-17 16:27:08.970497+00	\N
c8f020a2-9066-4d42-adf9-96c6523ea6b7	(303) 116-1672	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	26a14cfc-424f-42fc-98b0-ca7ddc12563b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.989428+00	2025-08-17 16:27:08.989428+00	\N
88c1358a-eafa-4d87-86ee-7860d72c97b3	(713) 769-7889	4751	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	26a14cfc-424f-42fc-98b0-ca7ddc12563b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.99294+00	2025-08-17 16:27:08.99294+00	\N
e7774e36-ddfd-485b-b3c0-d7a4d4683891	(206) 576-3278	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	34e3d58a-7972-48bc-9763-70f81fff7047	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.015368+00	2025-08-17 16:27:09.015368+00	\N
8710152d-2ac2-48d0-b2a4-f92b3c80c8c5	(212) 530-1565	10635	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	34e3d58a-7972-48bc-9763-70f81fff7047	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.017362+00	2025-08-17 16:27:09.017362+00	\N
04fe9865-e86f-435d-9722-ccfb6f2dd298	(415) 357-7170	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	3931d0ed-21f3-4c42-9c46-9d109fb49efe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.032213+00	2025-08-17 16:27:09.032213+00	\N
c4c45de8-d1b1-45df-bc2c-5db5f19612f0	(404) 605-7070	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	222a3bcf-c11d-4357-af01-e73a23bfe2fb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.045723+00	2025-08-17 16:27:09.045723+00	\N
d9d6d51a-799d-45be-8441-a55fc5b38336	(312) 286-5443	4976	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	222a3bcf-c11d-4357-af01-e73a23bfe2fb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.048117+00	2025-08-17 16:27:09.048117+00	\N
b007b11d-2456-4ae6-821f-af1b68476011	(713) 175-9026	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	ba177b04-db10-4ecf-ac88-5420d22d6a24	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.066039+00	2025-08-17 16:27:09.066039+00	\N
e7bf0778-72ce-478c-98c2-f88c35cd5998	(312) 148-6130	3715	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	ba177b04-db10-4ecf-ac88-5420d22d6a24	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.068131+00	2025-08-17 16:27:09.068131+00	\N
65f7d527-145d-43f5-8bb5-b100f9bae9ec	(214) 283-5487	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	aa802da1-5d54-4fae-a6e5-b34cf705cbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.083211+00	2025-08-17 16:27:09.083211+00	\N
547b5ad5-ade5-4e5d-b69b-595036355633	(312) 175-5870	10568	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	aa802da1-5d54-4fae-a6e5-b34cf705cbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.085056+00	2025-08-17 16:27:09.085056+00	\N
7d0b818c-d479-40ac-8cda-cfd0dda8721c	(415) 987-8423	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	aa802da1-5d54-4fae-a6e5-b34cf705cbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.086939+00	2025-08-17 16:27:09.086939+00	\N
b4e104bb-57e4-4f3f-a869-77b5b4d3edb0	(404) 779-8309	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	85eae53c-da16-4325-af27-990fa897ef7c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.10334+00	2025-08-17 16:27:09.10334+00	\N
0bbb7d44-b7c2-4d57-ba64-241bd186d2d3	(404) 349-7417	7040	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	85eae53c-da16-4325-af27-990fa897ef7c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.105252+00	2025-08-17 16:27:09.105252+00	\N
b948b54c-a9f9-4288-8334-a002a0a7074e	(713) 657-5238	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	5eb898e5-99f9-4347-b46f-5856733e4b9c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.12083+00	2025-08-17 16:27:09.12083+00	\N
32a586ec-5213-40d3-a3a5-1bf51117fcae	(305) 716-5044	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	dccfe585-17f2-48de-bdb4-5cf2854f339a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.134791+00	2025-08-17 16:27:09.134791+00	\N
4df6f7c1-17d1-4dc8-b3b9-ef0465cdf859	(212) 440-2517	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	951e604b-e969-4eca-8a13-c809f9c33ea9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.143123+00	2025-08-17 16:27:09.143123+00	\N
ab0075be-45be-44be-874e-1ab39170f13f	(305) 655-3650	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	1b3a6439-679b-4f20-8346-976b28e5b77c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.155828+00	2025-08-17 16:27:09.155828+00	\N
bf8beb39-1db9-480e-b6c7-88c2ebfd68e6	(312) 363-8977	2918	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	1b3a6439-679b-4f20-8346-976b28e5b77c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.157648+00	2025-08-17 16:27:09.157648+00	\N
ffcdaf25-342b-429d-b364-fe15ae619c20	(312) 688-9074	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	0e896c9c-119e-46c2-8abd-fb981c795ce5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.16991+00	2025-08-17 16:27:09.16991+00	\N
ade47cd5-03a4-41bb-8adb-6d212165c092	(312) 858-8440	9149	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	0e896c9c-119e-46c2-8abd-fb981c795ce5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.171757+00	2025-08-17 16:27:09.171757+00	\N
5df4dc2b-b361-4cc6-bd43-fc52ab4b2faf	(312) 936-7949	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	0e896c9c-119e-46c2-8abd-fb981c795ce5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.173782+00	2025-08-17 16:27:09.173782+00	\N
94788887-9ce1-45a7-b242-3e70b4c20817	(404) 585-3636	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	f824d895-18f5-4344-9ff7-bfb76ab6df98	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.186748+00	2025-08-17 16:27:09.186748+00	\N
11f6d124-aff5-4a0d-85a4-7619e680793d	(214) 668-6219	3594	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	f824d895-18f5-4344-9ff7-bfb76ab6df98	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.188612+00	2025-08-17 16:27:09.188612+00	\N
87b6253e-9e7d-438c-8390-3e944fffd70f	(404) 648-9672	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	6420c0a8-291d-4c42-b228-89764cde3686	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.200951+00	2025-08-17 16:27:09.200951+00	\N
12e0eae4-b50c-4345-858a-f9d556e3bada	(617) 801-3152	4879	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	6420c0a8-291d-4c42-b228-89764cde3686	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.203246+00	2025-08-17 16:27:09.203246+00	\N
13b825ec-3024-4f84-9eb7-032c9ddcd35b	(713) 647-6613	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	6420c0a8-291d-4c42-b228-89764cde3686	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.205173+00	2025-08-17 16:27:09.205173+00	\N
70d97269-69a9-444f-8e82-a3183efc65c5	(602) 662-2031	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	c0f35d3a-9c2d-4f7b-a6bb-1f92c55c415c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.220436+00	2025-08-17 16:27:09.220436+00	\N
2f1fbb13-9f5f-41b6-be30-fe18ea225910	(404) 976-1127	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	6e859df2-22d8-41b6-99d4-dfceab790528	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.233664+00	2025-08-17 16:27:09.233664+00	\N
7503c188-0963-4220-a1ac-cac6e137a03f	(404) 713-9326	9866	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	6e859df2-22d8-41b6-99d4-dfceab790528	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.235571+00	2025-08-17 16:27:09.235571+00	\N
5bb1e0ec-89f8-4c56-91f5-b2731b637b6b	(404) 136-4911	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	6e859df2-22d8-41b6-99d4-dfceab790528	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.237388+00	2025-08-17 16:27:09.237388+00	\N
f5b78bf9-a3d7-4d13-a72b-86905e7b925c	(305) 505-4422	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	4375098f-16fc-4d28-b962-52c7396818c8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.252481+00	2025-08-17 16:27:09.252481+00	\N
f1a18270-ce56-4ed4-ac28-698e83ff91b6	(305) 326-2910	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	1d1adc78-f37f-4139-8f20-987ee464e4ab	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.265361+00	2025-08-17 16:27:09.265361+00	\N
668abed9-f970-4ab5-93d0-0fb638b95b2a	(303) 802-2212	10379	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	1d1adc78-f37f-4139-8f20-987ee464e4ab	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.268007+00	2025-08-17 16:27:09.268007+00	\N
c6d7d9de-cfd3-4256-a5e5-7c90e7617432	(312) 684-1103	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	1d1adc78-f37f-4139-8f20-987ee464e4ab	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.270591+00	2025-08-17 16:27:09.270591+00	\N
4915927c-e74e-4ff7-92f1-85ddd19557fe	(617) 768-8957	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	a188730d-46cd-4d96-bbb3-6cb5f4edcc3e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.288181+00	2025-08-17 16:27:09.288181+00	\N
ad8c7bc8-89f4-4b45-ada7-d518497cd5c7	(303) 712-9580	4548	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	a188730d-46cd-4d96-bbb3-6cb5f4edcc3e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.290125+00	2025-08-17 16:27:09.290125+00	\N
a78a1b7b-6d87-4c39-be1b-3d789af37502	(212) 374-9782	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	fc0b81a6-fa60-4908-8cf3-8de83e8dac14	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.305564+00	2025-08-17 16:27:09.305564+00	\N
1b8e8d27-66a3-404e-b889-b2b8683e5d69	(303) 240-4913	7090	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	fc0b81a6-fa60-4908-8cf3-8de83e8dac14	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.307721+00	2025-08-17 16:27:09.307721+00	\N
c75b2c00-4c06-4c68-96c2-635eb4fcc0b7	(303) 893-2823	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	751ac3d4-abfb-4e44-bb2e-5eb440e1a95c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.322618+00	2025-08-17 16:27:09.322618+00	\N
06dff4bb-6f25-4c14-b3a1-2ea128547725	(303) 907-8894	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	8b644611-c702-4925-840e-f9fcb2d7e49e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.339118+00	2025-08-17 16:27:09.339118+00	\N
0b867cb8-bb19-4f3d-92ef-bfebf6dff8b0	(602) 934-2810	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	a3694834-ba15-417f-bc5f-f0ef8f32829a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.354534+00	2025-08-17 16:27:09.354534+00	\N
bb68f6b6-b148-43d4-a40a-5ffd4b8a8616	(602) 652-5487	2594	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	a3694834-ba15-417f-bc5f-f0ef8f32829a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.356521+00	2025-08-17 16:27:09.356521+00	\N
f021d44d-5885-4893-b588-a9d2f3f4dd6a	(602) 346-9142	\N	t	c44a42be-cb00-4b09-aba8-7cc55a1b58ab	e9b09322-628a-43e7-8c24-47eeb0242ccb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.370206+00	2025-08-17 16:27:09.370206+00	\N
b2fefcb8-3292-4635-b657-d749e0b8dace	(713) 485-7997	10578	f	6bbfe4df-c0d7-4a28-b1ae-25bc49e6a32f	e9b09322-628a-43e7-8c24-47eeb0242ccb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.372175+00	2025-08-17 16:27:09.372175+00	\N
7ac69f90-9c3c-4a16-be3a-6eb6cecb0d57	(312) 268-7940	\N	f	47d101c0-37b2-40aa-8f89-45b6bf0fa4fa	e9b09322-628a-43e7-8c24-47eeb0242ccb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.374318+00	2025-08-17 16:27:09.374318+00	\N
\.


--
-- TOC entry 3932 (class 0 OID 16699)
-- Dependencies: 221
-- Data for Name: pipelines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pipelines (id, name, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
dfb531fa-0093-43fd-ba8f-385f59a9e498	Default Sales Pipeline	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.188434+00	2025-08-14 10:06:11.188434+00	\N
\.


--
-- TOC entry 3963 (class 0 OID 17567)
-- Dependencies: 252
-- Data for Name: social_media_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_media_accounts (id, username, url, is_primary, type_id, entity_id, entity_type, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
4b334746-2152-4226-97b0-b003b9a4df71	emily_rodriguez	https://linkedin.com/in/emily_rodriguez	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	b9f04d97-3de9-4904-abfc-02da289b36c3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.586623+00	2025-08-17 16:27:08.586623+00	\N
9d192aba-7cc9-404b-9d55-e27810b47aef	emily.rodriguez	https://facebook.com/emily.rodriguez	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	b9f04d97-3de9-4904-abfc-02da289b36c3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.589371+00	2025-08-17 16:27:08.589371+00	\N
e8f77aa7-ab4f-4e80-9400-858ed1fb2262	christopher.wilson	https://linkedin.com/in/christopher.wilson	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	f3b9674b-6d74-44fc-8e45-d211e690bbbe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.667074+00	2025-08-17 16:27:08.667074+00	\N
4c1d817c-db18-4430-9b8f-07af68c6612b	christopherwilson328	https://instagram.com/christopherwilson601	f	d296fe4f-c51c-4607-ab40-b9590047742c	f3b9674b-6d74-44fc-8e45-d211e690bbbe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.668833+00	2025-08-17 16:27:08.668833+00	\N
dc6a1630-4f69-4b9a-b818-6b024b769b9c	james.brown	https://linkedin.com/in/jamesbrown363	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	cb7bd4d2-dd4f-4f3e-ac59-0a62a347c699	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.691738+00	2025-08-17 16:27:08.691738+00	\N
961857b5-c870-4eec-b175-61a279c28b91	ashley.king	https://linkedin.com/in/ashleyking522	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	4ca5e3bb-818b-4ea2-bdc4-302ba84030dd	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.896674+00	2025-08-17 16:27:08.896674+00	\N
ae811d1e-5561-4470-80b0-17720c99366e	ashley.king	https://twitter.com/ashley_king	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	4ca5e3bb-818b-4ea2-bdc4-302ba84030dd	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.900619+00	2025-08-17 16:27:08.900619+00	\N
0129ea0a-5ac6-46d7-a4ef-897fadaad3e6	matthew_wright	https://linkedin.com/in/matthew.wright	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	29785965-f1d8-404b-b676-66eb57674d18	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.916263+00	2025-08-17 16:27:08.916263+00	\N
303f9f03-1ac9-42c5-937c-2a9b37e2afc4	laurenlopez	https://linkedin.com/in/lauren.lopez	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	1c682b6d-deb0-4f45-b6f5-7fa15e022d6a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.932251+00	2025-08-17 16:27:08.932251+00	\N
a01ee23e-8de5-4ebf-a7a9-458ca4227f6a	laurenlopez399	https://twitter.com/laurenlopez444	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	1c682b6d-deb0-4f45-b6f5-7fa15e022d6a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.934184+00	2025-08-17 16:27:08.934184+00	\N
eb09a431-ddc2-44fa-9fff-5ae7f82b44b3	joshuahill894	https://linkedin.com/in/joshuahill399	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	d8447d3f-b609-4082-8465-a011f51df931	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.945347+00	2025-08-17 16:27:08.945347+00	\N
f2d84f3f-0a25-4299-a6ba-72220880ed5e	joshua.hill	https://facebook.com/joshua.hill	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	d8447d3f-b609-4082-8465-a011f51df931	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.947973+00	2025-08-17 16:27:08.947973+00	\N
360c4dae-06b9-44f4-a503-d659f9cb5064	joshuahill	https://instagram.com/joshuahill704	f	d296fe4f-c51c-4607-ab40-b9590047742c	d8447d3f-b609-4082-8465-a011f51df931	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.952972+00	2025-08-17 16:27:08.952972+00	\N
7ceb170f-1278-483e-997f-a6987d0fd6d1	meganscott575	https://linkedin.com/in/megan_scott	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	930ee9a5-7dc6-4c0e-aaa2-2ff6e58600a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.964297+00	2025-08-17 16:27:08.964297+00	\N
57c3cdc6-b958-4632-a032-593f31d3f177	meganscott279	https://twitter.com/megan_scott	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	930ee9a5-7dc6-4c0e-aaa2-2ff6e58600a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.966264+00	2025-08-17 16:27:08.966264+00	\N
10465bc1-adf0-4af6-b095-f3085d05257c	megan_scott	https://facebook.com/megan_scott	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	930ee9a5-7dc6-4c0e-aaa2-2ff6e58600a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.968234+00	2025-08-17 16:27:08.968234+00	\N
21e35a23-dfab-4753-8f0b-e0d1385b3ba8	justin.green	https://linkedin.com/in/justin_green	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	f980c170-c4ff-43bc-8a6e-1ffccdfc71e7	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.982336+00	2025-08-17 16:27:08.982336+00	\N
536f9971-d3bb-46c8-92b7-04f1e1f791ab	justin.green	https://twitter.com/justin.green	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	f980c170-c4ff-43bc-8a6e-1ffccdfc71e7	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:08.986149+00	2025-08-17 16:27:08.986149+00	\N
5e5988c7-b78c-4037-8294-7e3a415c9403	hannahadams530	https://linkedin.com/in/hannahadams	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	26a14cfc-424f-42fc-98b0-ca7ddc12563b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.008579+00	2025-08-17 16:27:09.008579+00	\N
e5b17c05-05f7-4c54-8c12-151644dbe73e	hannahadams188	https://facebook.com/hannah.adams	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	26a14cfc-424f-42fc-98b0-ca7ddc12563b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.011189+00	2025-08-17 16:27:09.011189+00	\N
ee2b533e-fa15-423b-b731-9cd3e7ccf9dd	hannahadams773	https://instagram.com/hannahadams	f	d296fe4f-c51c-4607-ab40-b9590047742c	26a14cfc-424f-42fc-98b0-ca7ddc12563b	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.013281+00	2025-08-17 16:27:09.013281+00	\N
bdcf195d-2a3e-4db6-8c4b-58e33b1ee16a	brandonbaker146	https://linkedin.com/in/brandonbaker	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	34e3d58a-7972-48bc-9763-70f81fff7047	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.025329+00	2025-08-17 16:27:09.025329+00	\N
e0e554cd-8310-4f26-b8d1-d4ffeeb22dc9	brandon.baker	https://instagram.com/brandonbaker	f	d296fe4f-c51c-4607-ab40-b9590047742c	34e3d58a-7972-48bc-9763-70f81fff7047	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.028344+00	2025-08-17 16:27:09.028344+00	\N
5f765fbd-ff49-48d4-a6eb-124dd8dbdc01	kaylagonzalez595	https://linkedin.com/in/kayla_gonzalez	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	3931d0ed-21f3-4c42-9c46-9d109fb49efe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.040762+00	2025-08-17 16:27:09.040762+00	\N
fa571d28-6f4e-451a-aaf2-c31657893baa	kaylagonzalez916	https://twitter.com/kayla_gonzalez	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	3931d0ed-21f3-4c42-9c46-9d109fb49efe	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.042526+00	2025-08-17 16:27:09.042526+00	\N
a77991e5-7551-4897-8702-8149b1968cbd	tylernelson	https://linkedin.com/in/tyler_nelson	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	222a3bcf-c11d-4357-af01-e73a23bfe2fb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.059169+00	2025-08-17 16:27:09.059169+00	\N
eeb2d319-e71f-47d9-ab6b-915b38bf94b1	tylernelson	https://twitter.com/tylernelson234	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	222a3bcf-c11d-4357-af01-e73a23bfe2fb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.062594+00	2025-08-17 16:27:09.062594+00	\N
57f20177-d23f-4e3d-830a-d5bb6be73085	alexandra_carter	https://linkedin.com/in/alexandra_carter	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	ba177b04-db10-4ecf-ac88-5420d22d6a24	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.07845+00	2025-08-17 16:27:09.07845+00	\N
df4032f0-6213-41ef-bd46-82f6337cc935	alexandracarter192	https://twitter.com/alexandra_carter	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	ba177b04-db10-4ecf-ac88-5420d22d6a24	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.080735+00	2025-08-17 16:27:09.080735+00	\N
a94fd6f7-45cf-4842-aff9-2bcdc4c8eebc	zachary_mitchell	https://linkedin.com/in/zachary_mitchell	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	aa802da1-5d54-4fae-a6e5-b34cf705cbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.094622+00	2025-08-17 16:27:09.094622+00	\N
22ff5b13-029c-4ee8-9534-a6cc96d74954	zacharymitchell	https://twitter.com/zacharymitchell	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	aa802da1-5d54-4fae-a6e5-b34cf705cbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.097132+00	2025-08-17 16:27:09.097132+00	\N
5865ebe0-bd0b-4132-9b63-856fed5c40ae	zacharymitchell851	https://facebook.com/zacharymitchell957	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	aa802da1-5d54-4fae-a6e5-b34cf705cbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.099491+00	2025-08-17 16:27:09.099491+00	\N
fe1d905a-1704-4e98-8db3-474f417a4b2e	zachary.mitchell	https://instagram.com/zachary.mitchell	f	d296fe4f-c51c-4607-ab40-b9590047742c	aa802da1-5d54-4fae-a6e5-b34cf705cbb6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.101421+00	2025-08-17 16:27:09.101421+00	\N
c21c1ea3-cb35-475c-801e-c2f51cb36033	victoriaperez	https://linkedin.com/in/victoria_perez	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	85eae53c-da16-4325-af27-990fa897ef7c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.11193+00	2025-08-17 16:27:09.11193+00	\N
1a2b133e-5da8-4db1-b28f-aa3e864a8787	victoriaperez168	https://twitter.com/victoria_perez	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	85eae53c-da16-4325-af27-990fa897ef7c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.114344+00	2025-08-17 16:27:09.114344+00	\N
009ffe5d-812e-488a-8af1-98ac279b2c0d	victoriaperez	https://facebook.com/victoria_perez	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	85eae53c-da16-4325-af27-990fa897ef7c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.11661+00	2025-08-17 16:27:09.11661+00	\N
c18f76db-30c4-4b0f-8fea-d29ed319b627	victoriaperez	https://instagram.com/victoria_perez	f	d296fe4f-c51c-4607-ab40-b9590047742c	85eae53c-da16-4325-af27-990fa897ef7c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.118957+00	2025-08-17 16:27:09.118957+00	\N
c8c592b1-583a-4736-896e-975e0cbc19de	nathanroberts49	https://linkedin.com/in/nathan_roberts	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	5eb898e5-99f9-4347-b46f-5856733e4b9c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.126822+00	2025-08-17 16:27:09.126822+00	\N
bfd5d83b-f1bd-4fba-a78e-853ef2c266d1	nathanroberts752	https://twitter.com/nathan_roberts	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	5eb898e5-99f9-4347-b46f-5856733e4b9c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.129618+00	2025-08-17 16:27:09.129618+00	\N
81883923-1f3e-4ee8-aac9-52a056c99ce7	nathanroberts	https://facebook.com/nathanroberts	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	5eb898e5-99f9-4347-b46f-5856733e4b9c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.132368+00	2025-08-17 16:27:09.132368+00	\N
2066eaaf-443f-4df7-a19b-fcd696404694	samantha_turner	https://linkedin.com/in/samanthaturner	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	dccfe585-17f2-48de-bdb4-5cf2854f339a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.14064+00	2025-08-17 16:27:09.14064+00	\N
c2c218e8-ab03-4e0d-be48-6fb413552666	ericphillips928	https://linkedin.com/in/eric.phillips	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	951e604b-e969-4eca-8a13-c809f9c33ea9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.150008+00	2025-08-17 16:27:09.150008+00	\N
56b89552-ab93-4c9f-9818-e14d26be2224	eric_phillips	https://twitter.com/eric.phillips	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	951e604b-e969-4eca-8a13-c809f9c33ea9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.151992+00	2025-08-17 16:27:09.151992+00	\N
f2529048-7007-4cb4-93ab-a9edf8e168b0	ericphillips928	https://facebook.com/eric_phillips	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	951e604b-e969-4eca-8a13-c809f9c33ea9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.153683+00	2025-08-17 16:27:09.153683+00	\N
4db19c36-1ec4-4950-92e5-9aab2c17d5e1	rebecca.campbell	https://linkedin.com/in/rebecca_campbell	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	1b3a6439-679b-4f20-8346-976b28e5b77c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.16569+00	2025-08-17 16:27:09.16569+00	\N
1206ab2b-bc29-4469-b2dc-59149fb12bd1	rebeccacampbell	https://facebook.com/rebecca_campbell	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	1b3a6439-679b-4f20-8346-976b28e5b77c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.167844+00	2025-08-17 16:27:09.167844+00	\N
6c89d6b3-94d9-4416-b057-cb175d494e05	adam.parker	https://linkedin.com/in/adam_parker	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	0e896c9c-119e-46c2-8abd-fb981c795ce5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.184073+00	2025-08-17 16:27:09.184073+00	\N
ad7a7f54-5285-4f57-bfe6-a2d4e068a2cf	michelleevans	https://linkedin.com/in/michelle.evans	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	f824d895-18f5-4344-9ff7-bfb76ab6df98	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.198116+00	2025-08-17 16:27:09.198116+00	\N
0a1f598a-17c3-4614-ad3e-a72b0c5c9764	steven_edwards	https://linkedin.com/in/steven.edwards	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	6420c0a8-291d-4c42-b228-89764cde3686	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.216755+00	2025-08-17 16:27:09.216755+00	\N
43f77515-7714-4857-b325-e4ef6a7e517b	stevenedwards	https://twitter.com/steven.edwards	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	6420c0a8-291d-4c42-b228-89764cde3686	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.218598+00	2025-08-17 16:27:09.218598+00	\N
8896f574-96d2-4a49-b4be-4350efe981e5	ambercollins183	https://linkedin.com/in/ambercollins140	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	c0f35d3a-9c2d-4f7b-a6bb-1f92c55c415c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.22929+00	2025-08-17 16:27:09.22929+00	\N
43f30e89-bc45-4f7c-9b8b-dd251b956472	ambercollins964	https://instagram.com/amber_collins	f	d296fe4f-c51c-4607-ab40-b9590047742c	c0f35d3a-9c2d-4f7b-a6bb-1f92c55c415c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.231278+00	2025-08-17 16:27:09.231278+00	\N
e46eba9f-ca1f-4795-bca0-f2534a250440	timothystewart	https://linkedin.com/in/timothy_stewart	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	6e859df2-22d8-41b6-99d4-dfceab790528	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.248178+00	2025-08-17 16:27:09.248178+00	\N
de8c47fb-7d13-4465-a744-277f29f740cd	timothy_stewart	https://twitter.com/timothy_stewart	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	6e859df2-22d8-41b6-99d4-dfceab790528	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.250109+00	2025-08-17 16:27:09.250109+00	\N
0ee856d0-329b-44dc-a4cf-0d8d291afead	daniellesanchez	https://linkedin.com/in/danielle_sanchez	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	4375098f-16fc-4d28-b962-52c7396818c8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.260944+00	2025-08-17 16:27:09.260944+00	\N
a49b2e35-fcaf-4397-81a6-78af1257ce31	daniellesanchez	https://facebook.com/daniellesanchez	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	4375098f-16fc-4d28-b962-52c7396818c8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.263189+00	2025-08-17 16:27:09.263189+00	\N
db52826d-c1f0-4351-88cc-a3d277c56319	kyle.morris	https://linkedin.com/in/kyle_morris	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	1d1adc78-f37f-4139-8f20-987ee464e4ab	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.280356+00	2025-08-17 16:27:09.280356+00	\N
7287279c-392e-42f5-b6e8-d11dfcb1cdb8	kyle_morris	https://twitter.com/kyle_morris	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	1d1adc78-f37f-4139-8f20-987ee464e4ab	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.282285+00	2025-08-17 16:27:09.282285+00	\N
212c9210-370a-496e-9de6-47e5c9c796ea	kyle.morris	https://facebook.com/kylemorris	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	1d1adc78-f37f-4139-8f20-987ee464e4ab	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.284203+00	2025-08-17 16:27:09.284203+00	\N
d86593df-e63a-43ff-95db-b44ea2131421	kylemorris703	https://instagram.com/kylemorris327	f	d296fe4f-c51c-4607-ab40-b9590047742c	1d1adc78-f37f-4139-8f20-987ee464e4ab	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.286364+00	2025-08-17 16:27:09.286364+00	\N
f9f6748a-4efd-4ed5-9a1e-1345a87c456f	brittanyrogers	https://linkedin.com/in/brittany.rogers	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	a188730d-46cd-4d96-bbb3-6cb5f4edcc3e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.299384+00	2025-08-17 16:27:09.299384+00	\N
07934a02-d4e2-476f-a04c-52885bc868a8	brittanyrogers395	https://twitter.com/brittany_rogers	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	a188730d-46cd-4d96-bbb3-6cb5f4edcc3e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.30121+00	2025-08-17 16:27:09.30121+00	\N
344e3c1e-dbea-4bf8-9ac1-3d9fcc3c4571	brittany_rogers	https://facebook.com/brittany_rogers	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	a188730d-46cd-4d96-bbb3-6cb5f4edcc3e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.303058+00	2025-08-17 16:27:09.303058+00	\N
9a20ee21-fe22-411e-83c2-360b6c6a86d4	jeffrey.reed	https://linkedin.com/in/jeffrey.reed	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	fc0b81a6-fa60-4908-8cf3-8de83e8dac14	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.31869+00	2025-08-17 16:27:09.31869+00	\N
4d8cf80e-4f01-4a35-9264-0e1a19547427	jeffreyreed	https://instagram.com/jeffreyreed281	f	d296fe4f-c51c-4607-ab40-b9590047742c	fc0b81a6-fa60-4908-8cf3-8de83e8dac14	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.320452+00	2025-08-17 16:27:09.320452+00	\N
27970664-d587-4e2b-9a64-91a4134a1da5	courtney.cook	https://linkedin.com/in/courtney.cook	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	751ac3d4-abfb-4e44-bb2e-5eb440e1a95c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.333488+00	2025-08-17 16:27:09.333488+00	\N
5c819450-64aa-40a7-8bad-bbdf3c7d7b9f	courtneycook	https://instagram.com/courtney.cook	f	d296fe4f-c51c-4607-ab40-b9590047742c	751ac3d4-abfb-4e44-bb2e-5eb440e1a95c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.336195+00	2025-08-17 16:27:09.336195+00	\N
f8b6b94d-76e8-412f-a2ce-8b39f3f37c1c	mark.morgan	https://linkedin.com/in/markmorgan861	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	8b644611-c702-4925-840e-f9fcb2d7e49e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.350095+00	2025-08-17 16:27:09.350095+00	\N
8734b3e7-cd3d-44c3-ab77-50c3a1ac2f91	mark_morgan	https://twitter.com/markmorgan830	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	8b644611-c702-4925-840e-f9fcb2d7e49e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.35225+00	2025-08-17 16:27:09.35225+00	\N
8eb43c84-6deb-4db1-a7de-57148e3226ea	tiffanybell	https://linkedin.com/in/tiffany.bell	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	a3694834-ba15-417f-bc5f-f0ef8f32829a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.368145+00	2025-08-17 16:27:09.368145+00	\N
a1f6c101-4609-4408-88ba-c5a691e74686	brianmurphy340	https://linkedin.com/in/brianmurphy	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	e9b09322-628a-43e7-8c24-47eeb0242ccb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.381545+00	2025-08-17 16:27:09.381545+00	\N
725782ba-15c0-4c80-8be0-d88eda295fab	brianmurphy950	https://instagram.com/brianmurphy	f	d296fe4f-c51c-4607-ab40-b9590047742c	e9b09322-628a-43e7-8c24-47eeb0242ccb	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-17 16:27:09.383465+00	2025-08-17 16:27:09.383465+00	\N
52c2a6a9-d68c-4d37-ba52-9ea2eb1e04ef	sarah_johnson	https://linkedin.com/in/sarahjohnson495	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	cd55c2c8-ecd2-487e-a1c4-52c280c2bf4c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.077578+00	2025-08-18 02:55:15.077578+00	\N
63443d63-15e0-42a1-8e87-e45546512d1c	michael_chen	https://linkedin.com/in/michael.chen	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	2771d43c-c1f9-4bda-9885-f81fea26023c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.093047+00	2025-08-18 02:55:15.093047+00	\N
703ff500-00c0-4400-9f5b-7cff9a8e0a3b	michael_chen	https://facebook.com/michael_chen	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	2771d43c-c1f9-4bda-9885-f81fea26023c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.094957+00	2025-08-18 02:55:15.094957+00	\N
4652b3f2-c351-4a0a-8714-df30cdec4b95	emily_rodriguez	https://linkedin.com/in/emilyrodriguez592	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	267eb4cd-fd86-40db-9a1a-17692fd0e23c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.10928+00	2025-08-18 02:55:15.10928+00	\N
88bbe4d7-8272-42f6-a60e-a0c320d5b37a	emilyrodriguez	https://facebook.com/emily_rodriguez	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	267eb4cd-fd86-40db-9a1a-17692fd0e23c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.111885+00	2025-08-18 02:55:15.111885+00	\N
5a2acc2b-12ff-47e4-b594-184a36661f34	davidthompson	https://linkedin.com/in/david.thompson	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	d461e239-611f-4a1c-a768-81bb4c34a0df	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.125314+00	2025-08-18 02:55:15.125314+00	\N
d4511adc-bc6b-4e1a-a5f9-49fecd7d92ac	david.thompson	https://instagram.com/david_thompson	f	d296fe4f-c51c-4607-ab40-b9590047742c	d461e239-611f-4a1c-a768-81bb4c34a0df	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.127251+00	2025-08-18 02:55:15.127251+00	\N
bc90c7f7-819d-43cf-b21b-3233d1495850	lisawang107	https://linkedin.com/in/lisawang	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	afc348bd-91d6-4d70-b977-a539027e318a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.136218+00	2025-08-18 02:55:15.136218+00	\N
cadc1257-e70d-4e69-9284-99771d7eabb4	lisa_wang	https://instagram.com/lisa.wang	f	d296fe4f-c51c-4607-ab40-b9590047742c	afc348bd-91d6-4d70-b977-a539027e318a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.138177+00	2025-08-18 02:55:15.138177+00	\N
2bb55dc8-1386-4019-b81b-727c8f96a422	robertanderson268	https://linkedin.com/in/robert.anderson	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	9b539c21-7c5d-4a8f-a0ec-87fb99dcda53	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.150233+00	2025-08-18 02:55:15.150233+00	\N
bfb8972a-8d28-486d-97b6-1ed50ef50c43	robert.anderson	https://facebook.com/robertanderson561	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	9b539c21-7c5d-4a8f-a0ec-87fb99dcda53	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.152466+00	2025-08-18 02:55:15.152466+00	\N
f29a00f2-f9fb-4529-bb2f-a132b2c8dcc9	jennifer.martinez	https://linkedin.com/in/jennifer.martinez	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	85431359-6040-491f-89a6-d18c651dda35	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.161492+00	2025-08-18 02:55:15.161492+00	\N
25e5f356-b022-4b5f-aa45-b4f5e9f540a8	christopherwilson	https://linkedin.com/in/christopherwilson	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	ce38cfeb-efc5-4be9-943d-8a7d13054252	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.172212+00	2025-08-18 02:55:15.172212+00	\N
81280964-c675-48b3-a0eb-dc9d71ea8ff2	christopherwilson182	https://twitter.com/christopher_wilson	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	ce38cfeb-efc5-4be9-943d-8a7d13054252	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.173823+00	2025-08-18 02:55:15.173823+00	\N
ff6fc03c-9920-4cdc-b300-2cb240d9cab0	amanda_taylor	https://linkedin.com/in/amanda.taylor	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	41a1889f-0ce5-44b6-90ae-74f94ae8395f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.186214+00	2025-08-18 02:55:15.186214+00	\N
a8452d04-f0c0-48cb-8cfd-7803c229bf16	amandataylor	https://twitter.com/amanda_taylor	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	41a1889f-0ce5-44b6-90ae-74f94ae8395f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.188048+00	2025-08-18 02:55:15.188048+00	\N
5c15fa1b-e4d6-455e-9f8e-ac298eba4822	amanda_taylor	https://facebook.com/amandataylor	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	41a1889f-0ce5-44b6-90ae-74f94ae8395f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.189818+00	2025-08-18 02:55:15.189818+00	\N
6f0c1470-c422-40c0-9310-89fd7c9b2739	jamesbrown	https://linkedin.com/in/james.brown	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	29f657bd-ad62-4ff8-9079-e752adb8fc95	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.200925+00	2025-08-18 02:55:15.200925+00	\N
2e84e118-995a-4fc3-9bf3-e5d851d01ca3	jamesbrown835	https://twitter.com/jamesbrown215	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	29f657bd-ad62-4ff8-9079-e752adb8fc95	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.202641+00	2025-08-18 02:55:15.202641+00	\N
e200ecf7-f27e-4e6a-a18e-865a06f751ed	james.brown	https://instagram.com/jamesbrown	f	d296fe4f-c51c-4607-ab40-b9590047742c	29f657bd-ad62-4ff8-9079-e752adb8fc95	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.204363+00	2025-08-18 02:55:15.204363+00	\N
f47ef382-4fb3-4472-a740-d1b9f85b487b	maria.garcia	https://linkedin.com/in/maria_garcia	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	9e870dbe-365e-47a7-a95c-0f67dd9cebde	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.213369+00	2025-08-18 02:55:15.213369+00	\N
03f8c505-6ef2-418d-b85c-922b73908fe0	mariagarcia	https://facebook.com/mariagarcia468	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	9e870dbe-365e-47a7-a95c-0f67dd9cebde	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.214992+00	2025-08-18 02:55:15.214992+00	\N
eb8e7abd-0b8b-4844-a9de-c0fba69acab2	kevin_lee	https://linkedin.com/in/kevinlee	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	7815fdbc-9c74-42e0-bbce-f38f376245b8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.22442+00	2025-08-18 02:55:15.22442+00	\N
3d25d4c2-954c-4b19-8dff-d9275aa9de2e	kevin_lee	https://facebook.com/kevin.lee	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	7815fdbc-9c74-42e0-bbce-f38f376245b8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.226084+00	2025-08-18 02:55:15.226084+00	\N
23fce058-d1b7-47f9-ab99-b266fad518af	kevinlee462	https://instagram.com/kevinlee953	f	d296fe4f-c51c-4607-ab40-b9590047742c	7815fdbc-9c74-42e0-bbce-f38f376245b8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.227765+00	2025-08-18 02:55:15.227765+00	\N
1e469b15-5eda-49e9-96a4-5fba18e1cda7	racheldavis850	https://linkedin.com/in/racheldavis	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	b6a49221-833f-4f0e-9a50-c851993efc85	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.237577+00	2025-08-18 02:55:15.237577+00	\N
c85e8307-b236-410f-aaae-0b00bdaeaa80	rachel.davis	https://facebook.com/rachel_davis	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	b6a49221-833f-4f0e-9a50-c851993efc85	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.240056+00	2025-08-18 02:55:15.240056+00	\N
28a5bcc0-b631-4c9d-a9e5-e9713b66e2a7	thomasmiller	https://linkedin.com/in/thomasmiller	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	908904fb-611c-4d96-ac00-112efaad8b5a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.24958+00	2025-08-18 02:55:15.24958+00	\N
3dd0ae41-a9c7-4f4d-8c48-1309d712f2e4	thomas.miller	https://twitter.com/thomasmiller657	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	908904fb-611c-4d96-ac00-112efaad8b5a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.251257+00	2025-08-18 02:55:15.251257+00	\N
8f33f61c-b0ee-4785-ad1f-a9259f6ecd97	thomasmiller472	https://facebook.com/thomasmiller	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	908904fb-611c-4d96-ac00-112efaad8b5a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.2529+00	2025-08-18 02:55:15.2529+00	\N
b95b2d7b-5bae-45af-a167-1f61557b85e7	nicolewhite299	https://linkedin.com/in/nicolewhite	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	91fc63e7-940c-4fb1-9c07-c465ac942d49	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.261557+00	2025-08-18 02:55:15.261557+00	\N
1ae9f6b8-f420-44ad-a2fb-e7484fc1dd05	danielclark740	https://linkedin.com/in/danielclark	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	8dd1c642-ce9c-4c71-9edb-71cbc4f4fbd4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.271948+00	2025-08-18 02:55:15.271948+00	\N
1ff029d8-fa6e-45fe-85be-8a2b7c476370	daniel_clark	https://instagram.com/danielclark	f	d296fe4f-c51c-4607-ab40-b9590047742c	8dd1c642-ce9c-4c71-9edb-71cbc4f4fbd4	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.273776+00	2025-08-18 02:55:15.273776+00	\N
a376ddd3-7308-4bdd-86f3-7a87d7e8605f	stephanielewis709	https://linkedin.com/in/stephanie.lewis	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	23391801-1492-42b3-8dbd-547d8543849e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.285873+00	2025-08-18 02:55:15.285873+00	\N
412625fa-352a-4818-a42c-62175e2acb1e	stephanie.lewis	https://twitter.com/stephanielewis	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	23391801-1492-42b3-8dbd-547d8543849e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.287585+00	2025-08-18 02:55:15.287585+00	\N
19c0433f-9a50-4b61-bd07-a6356f6d4d5a	stephanielewis592	https://facebook.com/stephanielewis	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	23391801-1492-42b3-8dbd-547d8543849e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.289328+00	2025-08-18 02:55:15.289328+00	\N
044ccbba-5788-433c-a923-06a083001361	andrew_hall	https://linkedin.com/in/andrew_hall	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	31ecbbc0-e8e3-40d4-a154-82a3e5d00c26	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.300154+00	2025-08-18 02:55:15.300154+00	\N
b125ba27-f44b-4a7c-99db-15ca6d18f8e6	andrewhall	https://twitter.com/andrew_hall	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	31ecbbc0-e8e3-40d4-a154-82a3e5d00c26	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.301975+00	2025-08-18 02:55:15.301975+00	\N
5a7d4b58-55b4-4117-b570-f8d429e3f898	andrew_hall	https://facebook.com/andrew_hall	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	31ecbbc0-e8e3-40d4-a154-82a3e5d00c26	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.303672+00	2025-08-18 02:55:15.303672+00	\N
bf8b7ae6-10db-466b-9bcf-a0e4ee97bde7	jessica_allen	https://linkedin.com/in/jessica.allen	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	646d6f02-718a-4c53-bbbd-d58eea128eae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.316139+00	2025-08-18 02:55:15.316139+00	\N
360b8a42-8148-4628-9529-b6ac7dcb9ee0	jessicaallen	https://twitter.com/jessica.allen	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	646d6f02-718a-4c53-bbbd-d58eea128eae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.317739+00	2025-08-18 02:55:15.317739+00	\N
20669236-510b-4f99-8c72-e9eb139dc114	jessica.allen	https://instagram.com/jessicaallen	f	d296fe4f-c51c-4607-ab40-b9590047742c	646d6f02-718a-4c53-bbbd-d58eea128eae	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.319347+00	2025-08-18 02:55:15.319347+00	\N
edf25df8-cb5a-4860-8332-679406692411	ryanyoung413	https://linkedin.com/in/ryanyoung421	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	121e9087-021e-40b7-940d-67ad17509dfc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.330403+00	2025-08-18 02:55:15.330403+00	\N
e50f793e-c0cb-4b49-8326-d3215b1ab91e	ryan_young	https://facebook.com/ryanyoung358	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	121e9087-021e-40b7-940d-67ad17509dfc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.332067+00	2025-08-18 02:55:15.332067+00	\N
46d0eb23-dbc3-4e83-9c2b-3043f3d13903	ryanyoung	https://instagram.com/ryan_young	f	d296fe4f-c51c-4607-ab40-b9590047742c	121e9087-021e-40b7-940d-67ad17509dfc	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.333827+00	2025-08-18 02:55:15.333827+00	\N
4a211303-588e-4eb5-bdd2-847813bc1af2	ashley.king	https://linkedin.com/in/ashley.king	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	236a6915-c1e6-4383-84a4-e1beeae48946	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.345952+00	2025-08-18 02:55:15.345952+00	\N
4e7ca1a3-46c7-41f4-b7ad-900d3cb21788	ashley_king	https://facebook.com/ashley_king	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	236a6915-c1e6-4383-84a4-e1beeae48946	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.347646+00	2025-08-18 02:55:15.347646+00	\N
b843df52-d05c-45d5-b16c-5f4867f4cf4e	matthewwright996	https://linkedin.com/in/matthew_wright	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	37df802c-9567-49cd-ac53-32844bfac8e9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.361501+00	2025-08-18 02:55:15.361501+00	\N
450b8895-c810-4d47-9eb4-f86f4a137754	matthewwright305	https://twitter.com/matthewwright308	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	37df802c-9567-49cd-ac53-32844bfac8e9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.365433+00	2025-08-18 02:55:15.365433+00	\N
a4f6de3b-60b7-436d-8713-35ec27cc1929	laurenlopez	https://linkedin.com/in/lauren.lopez	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	287bc30a-d62a-4e07-a6f8-c5046d07f99e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.383452+00	2025-08-18 02:55:15.383452+00	\N
53238941-b900-447e-9bbe-b2e087c5d218	lauren_lopez	https://twitter.com/laurenlopez	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	287bc30a-d62a-4e07-a6f8-c5046d07f99e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.388589+00	2025-08-18 02:55:15.388589+00	\N
84c3740d-1ad8-46b5-96ab-a18812c422f4	laurenlopez243	https://instagram.com/lauren_lopez	f	d296fe4f-c51c-4607-ab40-b9590047742c	287bc30a-d62a-4e07-a6f8-c5046d07f99e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.394331+00	2025-08-18 02:55:15.394331+00	\N
3cc5bbcb-54f0-4aca-bee1-8989bb9d9e17	joshuahill	https://linkedin.com/in/joshua_hill	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	54c1338c-8fa7-4983-9757-423a70ef6cf5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.422371+00	2025-08-18 02:55:15.422371+00	\N
3b29b3b5-9a2d-4abc-b216-a3fa1c196f3e	joshua.hill	https://twitter.com/joshuahill	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	54c1338c-8fa7-4983-9757-423a70ef6cf5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.429441+00	2025-08-18 02:55:15.429441+00	\N
00b9d537-19aa-4a56-80b5-55f44a551ac9	joshuahill	https://instagram.com/joshuahill861	f	d296fe4f-c51c-4607-ab40-b9590047742c	54c1338c-8fa7-4983-9757-423a70ef6cf5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.43576+00	2025-08-18 02:55:15.43576+00	\N
44d314cc-3c91-435e-8b91-ef489c1b0f17	meganscott	https://linkedin.com/in/meganscott559	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	b24ead22-d7df-4e0f-a8f5-79dd1d93f71f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.46422+00	2025-08-18 02:55:15.46422+00	\N
c372780b-ac23-422f-ad21-c70870462669	justingreen344	https://linkedin.com/in/justin.green	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	52960a86-cfc0-476b-b93a-eac715fd2227	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.484244+00	2025-08-18 02:55:15.484244+00	\N
6f034e97-7dd6-4ab1-910e-5dccab664a18	justingreen	https://twitter.com/justin_green	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	52960a86-cfc0-476b-b93a-eac715fd2227	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.486936+00	2025-08-18 02:55:15.486936+00	\N
e610abec-8538-4ce7-84ea-7ef2a925f933	hannah_adams	https://linkedin.com/in/hannahadams128	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	a40ac272-8ac6-455e-8d84-bd776c8a067e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.503559+00	2025-08-18 02:55:15.503559+00	\N
e6a7e197-2e4e-41b0-bdaf-262e4f2af759	hannah_adams	https://instagram.com/hannahadams	f	d296fe4f-c51c-4607-ab40-b9590047742c	a40ac272-8ac6-455e-8d84-bd776c8a067e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.506667+00	2025-08-18 02:55:15.506667+00	\N
95086f2d-a97c-4096-a988-6306cd5fa9a5	brandonbaker	https://linkedin.com/in/brandonbaker	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	b27f9347-98a5-4539-a8a3-cec91d478d58	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.518411+00	2025-08-18 02:55:15.518411+00	\N
7c27e6ab-7486-4519-aa37-51d1c6b0ae8d	brandon_baker	https://twitter.com/brandonbaker735	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	b27f9347-98a5-4539-a8a3-cec91d478d58	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.520522+00	2025-08-18 02:55:15.520522+00	\N
742bfafa-576d-4a81-994b-8bbee6bf146a	brandonbaker	https://facebook.com/brandon.baker	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	b27f9347-98a5-4539-a8a3-cec91d478d58	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.52294+00	2025-08-18 02:55:15.52294+00	\N
79ed42a2-907e-435b-a4ca-5c490a2ba28f	brandonbaker410	https://instagram.com/brandon_baker	f	d296fe4f-c51c-4607-ab40-b9590047742c	b27f9347-98a5-4539-a8a3-cec91d478d58	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.525286+00	2025-08-18 02:55:15.525286+00	\N
88942da6-71c3-406c-8b88-0009b1011254	kayla_gonzalez	https://linkedin.com/in/kaylagonzalez784	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	2ee58325-4cf0-4ccb-99a2-4d2259a7c52a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.536203+00	2025-08-18 02:55:15.536203+00	\N
d77115bf-a14a-49b4-811d-0933b8632b09	kayla.gonzalez	https://twitter.com/kaylagonzalez	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	2ee58325-4cf0-4ccb-99a2-4d2259a7c52a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.538601+00	2025-08-18 02:55:15.538601+00	\N
8112a04d-227a-4566-90f4-fd25e8c22e0e	tylernelson205	https://linkedin.com/in/tylernelson	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	0eb4c92d-9868-4774-9318-f87dce8e1ce1	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.552412+00	2025-08-18 02:55:15.552412+00	\N
42771476-8a7a-4498-97fc-dd042780fae3	tylernelson603	https://twitter.com/tyler_nelson	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	0eb4c92d-9868-4774-9318-f87dce8e1ce1	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.55522+00	2025-08-18 02:55:15.55522+00	\N
bc62e2bf-6904-4bf1-b123-a712252a64f3	alexandracarter	https://linkedin.com/in/alexandra_carter	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	a65d6716-0816-480b-a6a6-77b4b62f9330	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.572599+00	2025-08-18 02:55:15.572599+00	\N
334bf6e8-dae8-4344-8af6-1b2f95154bb2	alexandracarter	https://twitter.com/alexandra_carter	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	a65d6716-0816-480b-a6a6-77b4b62f9330	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.57534+00	2025-08-18 02:55:15.57534+00	\N
3ae17413-216c-407d-a9d5-7cff916aefcc	alexandra.carter	https://facebook.com/alexandracarter	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	a65d6716-0816-480b-a6a6-77b4b62f9330	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.579291+00	2025-08-18 02:55:15.579291+00	\N
e0459be8-d150-4975-b6f8-fa594b802041	zacharymitchell855	https://linkedin.com/in/zachary_mitchell	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	367e6934-6b67-497f-888a-53155fa4fbc8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.597776+00	2025-08-18 02:55:15.597776+00	\N
8b97ae7a-61ec-4371-97f2-56dcac7ba897	zacharymitchell722	https://facebook.com/zachary_mitchell	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	367e6934-6b67-497f-888a-53155fa4fbc8	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.600121+00	2025-08-18 02:55:15.600121+00	\N
d07ad1c3-1362-4796-ae52-6db69933a694	victoria.perez	https://linkedin.com/in/victoria_perez	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	2c88a6c9-6f3b-4fd8-86fa-fd0581c2dcb2	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.616549+00	2025-08-18 02:55:15.616549+00	\N
c36e6a5d-5c98-4a4a-b75c-99ecdc6625fc	victoria_perez	https://facebook.com/victoria.perez	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	2c88a6c9-6f3b-4fd8-86fa-fd0581c2dcb2	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.618905+00	2025-08-18 02:55:15.618905+00	\N
5a4692a3-b81a-4ddd-b12f-6e020d549a91	nathanroberts984	https://linkedin.com/in/nathanroberts690	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	ceb3f035-6384-4650-b385-02b8c704f477	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.637348+00	2025-08-18 02:55:15.637348+00	\N
22c29bd4-4ce1-46ad-bb68-19bbf97f0dd8	nathanroberts	https://twitter.com/nathanroberts672	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	ceb3f035-6384-4650-b385-02b8c704f477	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.639688+00	2025-08-18 02:55:15.639688+00	\N
ed87dfaa-9273-43a8-bc48-a4d40d3f829b	samanthaturner	https://linkedin.com/in/samanthaturner829	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	0a518a68-b89c-4e08-aee0-c05334e7dc57	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.649362+00	2025-08-18 02:55:15.649362+00	\N
5287d4c1-3e38-472e-99e8-63aa1ced5bf0	samanthaturner	https://facebook.com/samantha_turner	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	0a518a68-b89c-4e08-aee0-c05334e7dc57	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.651196+00	2025-08-18 02:55:15.651196+00	\N
a08bd514-8de8-4b18-88ae-9e5000d2d1af	ericphillips	https://linkedin.com/in/ericphillips51	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	b19ac50e-e030-41bb-9671-53b1dd331a30	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.663885+00	2025-08-18 02:55:15.663885+00	\N
06d0c73f-9165-42ee-9c5e-18999c6e76e1	eric.phillips	https://twitter.com/eric.phillips	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	b19ac50e-e030-41bb-9671-53b1dd331a30	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.666489+00	2025-08-18 02:55:15.666489+00	\N
11e675c1-3e75-49ad-a9da-c8725df60cd5	eric.phillips	https://facebook.com/ericphillips72	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	b19ac50e-e030-41bb-9671-53b1dd331a30	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.669184+00	2025-08-18 02:55:15.669184+00	\N
b50361cc-da84-4e86-8cd7-8564002b4527	rebeccacampbell518	https://linkedin.com/in/rebeccacampbell	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	01b05834-bb0d-43c8-b4da-ed27dbd912a9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.682593+00	2025-08-18 02:55:15.682593+00	\N
e761361a-b2c7-46b3-9894-4a490093fc94	adamparker	https://linkedin.com/in/adam.parker	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	e1e0af9b-b354-492c-ad7a-1eac6822b94f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.692031+00	2025-08-18 02:55:15.692031+00	\N
ea545116-8475-4b34-886c-06952c1f5e73	adam.parker	https://twitter.com/adamparker856	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	e1e0af9b-b354-492c-ad7a-1eac6822b94f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.6938+00	2025-08-18 02:55:15.6938+00	\N
b2cba483-5d57-4c79-b4d5-39703db87b10	adam.parker	https://facebook.com/adam_parker	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	e1e0af9b-b354-492c-ad7a-1eac6822b94f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.695515+00	2025-08-18 02:55:15.695515+00	\N
efff9b44-e572-484d-9b9d-507bf46156e3	adamparker67	https://instagram.com/adamparker231	f	d296fe4f-c51c-4607-ab40-b9590047742c	e1e0af9b-b354-492c-ad7a-1eac6822b94f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.697498+00	2025-08-18 02:55:15.697498+00	\N
27faf2bf-bf8e-4229-9ac2-43953e21e625	michelle_evans	https://linkedin.com/in/michelleevans	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	120b214a-074b-4a9a-9fc5-ca36d2a2f9b3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.704694+00	2025-08-18 02:55:15.704694+00	\N
d05c763e-a757-4547-8b6f-1363d563cead	michelle_evans	https://twitter.com/michelleevans470	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	120b214a-074b-4a9a-9fc5-ca36d2a2f9b3	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.706566+00	2025-08-18 02:55:15.706566+00	\N
5e7006c7-e9b5-4e53-bf83-676c066ffd5f	stevenedwards247	https://linkedin.com/in/steven.edwards	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	f62f2ffe-bc11-4ad4-aa1e-394c378a0961	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.71663+00	2025-08-18 02:55:15.71663+00	\N
681031cb-6f05-47f4-ac6b-01ea58ae55b9	stevenedwards	https://twitter.com/steven.edwards	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	f62f2ffe-bc11-4ad4-aa1e-394c378a0961	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.718347+00	2025-08-18 02:55:15.718347+00	\N
8069038d-4eb9-4d24-8548-0511cdb83553	amber_collins	https://linkedin.com/in/amber.collins	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	376ca675-1847-46a9-bca9-e44389fa2b37	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.731147+00	2025-08-18 02:55:15.731147+00	\N
1e82be55-89ef-4590-bd5e-d2c0ff1773e4	timothystewart137	https://linkedin.com/in/timothystewart356	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	f6fba39d-6836-4bae-9510-36e23bb12d7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.74157+00	2025-08-18 02:55:15.74157+00	\N
1d7cee24-b1bc-49f6-a521-e6580fb7b60d	timothy_stewart	https://facebook.com/timothy_stewart	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	f6fba39d-6836-4bae-9510-36e23bb12d7a	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.743456+00	2025-08-18 02:55:15.743456+00	\N
3833234c-0513-44e9-88c7-6e5d7372414a	danielle_sanchez	https://linkedin.com/in/danielle.sanchez	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	97b27d1b-a376-4804-a447-ecd4dd1cda7f	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.756709+00	2025-08-18 02:55:15.756709+00	\N
407b8cb6-5d8a-41e1-8a38-f902d39099e9	kyle_morris	https://linkedin.com/in/kylemorris	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	bd856c40-6e97-4f86-a3b9-7aba2618a39c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.763816+00	2025-08-18 02:55:15.763816+00	\N
8d6b6ded-358b-41cf-b04a-4abb003470c4	kylemorris	https://twitter.com/kylemorris	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	bd856c40-6e97-4f86-a3b9-7aba2618a39c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.765577+00	2025-08-18 02:55:15.765577+00	\N
08ac8abb-06d1-4b6b-bd0b-6351e6d2d1ac	kylemorris384	https://instagram.com/kylemorris	f	d296fe4f-c51c-4607-ab40-b9590047742c	bd856c40-6e97-4f86-a3b9-7aba2618a39c	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.767351+00	2025-08-18 02:55:15.767351+00	\N
1387043c-3e0b-43a2-a31c-044b10a7328d	brittanyrogers182	https://linkedin.com/in/brittany_rogers	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	2a4ec289-cd62-496d-9635-e0b2959234c9	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.778778+00	2025-08-18 02:55:15.778778+00	\N
f5851f42-348a-44a8-b2f5-78fcd4e212f7	jeffreyreed	https://linkedin.com/in/jeffrey.reed	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	a3359bff-5b5f-4e0a-a8fc-d5b45b3a0024	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.78916+00	2025-08-18 02:55:15.78916+00	\N
b5e48dfd-f21d-4621-814b-1f2e00fdc767	courtneycook	https://linkedin.com/in/courtneycook24	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	0c444676-f5e5-4275-b438-caff065b3d22	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.802336+00	2025-08-18 02:55:15.802336+00	\N
5d22603a-0b9b-4a7a-a3f7-264ce52cc5e2	courtney_cook	https://twitter.com/courtneycook788	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	0c444676-f5e5-4275-b438-caff065b3d22	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.804+00	2025-08-18 02:55:15.804+00	\N
93c05bd4-9461-412f-b8ba-480588a3d1c7	courtneycook377	https://facebook.com/courtney_cook	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	0c444676-f5e5-4275-b438-caff065b3d22	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.805752+00	2025-08-18 02:55:15.805752+00	\N
9e9cbb22-430f-4fb1-87f0-5274450677ee	courtney_cook	https://instagram.com/courtney.cook	f	d296fe4f-c51c-4607-ab40-b9590047742c	0c444676-f5e5-4275-b438-caff065b3d22	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.807521+00	2025-08-18 02:55:15.807521+00	\N
8f251dca-ee41-4b54-b3be-cac8d6c582d4	mark_morgan	https://linkedin.com/in/markmorgan679	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	4f586d8f-4b05-4bb9-8b3a-70ccaccfefd6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.81634+00	2025-08-18 02:55:15.81634+00	\N
1f3a9dc3-06bd-45a7-9c41-cb6345d7bde8	mark_morgan	https://twitter.com/mark.morgan	f	15ebfb7f-7d7c-47ed-84af-370a7718b497	4f586d8f-4b05-4bb9-8b3a-70ccaccfefd6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.818005+00	2025-08-18 02:55:15.818005+00	\N
0cd452f3-d9b3-4571-9f22-409a0313264b	mark.morgan	https://facebook.com/mark.morgan	f	7a5c5332-3e24-4125-ab77-fc485ad8658b	4f586d8f-4b05-4bb9-8b3a-70ccaccfefd6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.819626+00	2025-08-18 02:55:15.819626+00	\N
d7a714b8-b332-4901-a15c-d131b4d91f03	markmorgan47	https://instagram.com/markmorgan743	f	d296fe4f-c51c-4607-ab40-b9590047742c	4f586d8f-4b05-4bb9-8b3a-70ccaccfefd6	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.821277+00	2025-08-18 02:55:15.821277+00	\N
618cef81-b478-4656-9a5c-56151bdbcd7c	tiffanybell584	https://linkedin.com/in/tiffany_bell	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	b2eba624-0dd1-4178-964d-837b6959c1a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.832317+00	2025-08-18 02:55:15.832317+00	\N
4e61db10-f0b5-423d-baf4-c7cae8517bb1	tiffanybell	https://instagram.com/tiffanybell707	f	d296fe4f-c51c-4607-ab40-b9590047742c	b2eba624-0dd1-4178-964d-837b6959c1a5	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.834215+00	2025-08-18 02:55:15.834215+00	\N
857ed831-ef7d-4228-9d0c-63b212fae3ee	brian_murphy	https://linkedin.com/in/brian.murphy	t	490abe08-dde2-4ea8-bdde-0be5a94bd952	cd4a1698-ccc4-4e51-b67d-0359d996f47e	Contact	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-18 02:55:15.847006+00	2025-08-18 02:55:15.847006+00	\N
\.


--
-- TOC entry 3949 (class 0 OID 17097)
-- Dependencies: 238
-- Data for Name: social_media_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_media_types (id, name, code, icon, base_url, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
490abe08-dde2-4ea8-bdde-0be5a94bd952	LinkedIn	LINKEDIN	linkedin	https://linkedin.com/in/	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.48584+00	2025-08-15 08:15:49.48584+00	\N
15ebfb7f-7d7c-47ed-84af-370a7718b497	Twitter	TWITTER	twitter	https://twitter.com/	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.488753+00	2025-08-15 08:15:49.488753+00	\N
7a5c5332-3e24-4125-ab77-fc485ad8658b	Facebook	FACEBOOK	facebook	https://facebook.com/	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.491692+00	2025-08-15 08:15:49.491692+00	\N
d296fe4f-c51c-4607-ab40-b9590047742c	Instagram	INSTAGRAM	instagram	https://instagram.com/	t	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-15 08:15:49.493873+00	2025-08-15 08:15:49.493873+00	\N
\.


--
-- TOC entry 3933 (class 0 OID 16714)
-- Dependencies: 222
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
-- TOC entry 3936 (class 0 OID 16791)
-- Dependencies: 225
-- Data for Name: task_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_types (id, name, code, description, color, icon, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3953 (class 0 OID 17248)
-- Dependencies: 242
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, type_id, priority, status, due_date, completed_at, assigned_user_id, created_by, lead_id, deal_id, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3930 (class 0 OID 16671)
-- Dependencies: 219
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, subdomain, is_active, settings, created_at, updated_at, deleted_at) FROM stdin;
4832fed8-e0b5-4f01-9b1c-09710c9a4555	Default Organization	default	t	\N	2025-08-14 10:06:11.125489+00	2025-08-14 10:06:11.125489+00	\N
\.


--
-- TOC entry 3954 (class 0 OID 17313)
-- Dependencies: 243
-- Data for Name: territories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.territories (id, name, type_id, countries, states, cities, postal_codes, industries, company_size, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3945 (class 0 OID 17033)
-- Dependencies: 234
-- Data for Name: territory_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.territory_types (id, name, code, description, is_active, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3931 (class 0 OID 16682)
-- Dependencies: 220
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, name, code, description, is_active, is_system, permissions, tenant_id, created_at, updated_at, deleted_at) FROM stdin;
db4d49fe-3883-4104-85d3-bd165b4028a7	Administrator	ADMIN	Full system access	t	t	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.128648+00	2025-08-14 10:06:11.128648+00	\N
4896e3ec-ee5f-4fb7-b438-0a92c38058bb	Sales Manager	SALES_MANAGER	Sales management access	t	t	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.132419+00	2025-08-14 10:06:11.132419+00	\N
bdeb5d86-3b3e-4e70-b497-ec18475acd42	Sales Representative	SALES_REP	Sales representative access	t	t	\N	4832fed8-e0b5-4f01-9b1c-09710c9a4555	2025-08-14 10:06:11.13532+00	2025-08-14 10:06:11.13532+00	\N
\.


--
-- TOC entry 3955 (class 0 OID 17332)
-- Dependencies: 244
-- Data for Name: user_territories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_territories (territory_id, user_id) FROM stdin;
\.


--
-- TOC entry 3950 (class 0 OID 17139)
-- Dependencies: 239
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
-- TOC entry 3556 (class 2606 OID 16395)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3564 (class 2606 OID 16657)
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- TOC entry 3690 (class 2606 OID 17697)
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3632 (class 2606 OID 17089)
-- Name: address_types address_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address_types
    ADD CONSTRAINT address_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3676 (class 2606 OID 17535)
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 3558 (class 2606 OID 16628)
-- Name: calls calls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_pkey PRIMARY KEY (id);


--
-- TOC entry 3668 (class 2606 OID 17440)
-- Name: communication_attachments communication_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communication_attachments
    ADD CONSTRAINT communication_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 3616 (class 2606 OID 17025)
-- Name: communication_types communication_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communication_types
    ADD CONSTRAINT communication_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3665 (class 2606 OID 17401)
-- Name: communications communications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT communications_pkey PRIMARY KEY (id);


--
-- TOC entry 3591 (class 2606 OID 16826)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 3583 (class 2606 OID 16759)
-- Name: company_sizes company_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_sizes
    ADD CONSTRAINT company_sizes_pkey PRIMARY KEY (id);


--
-- TOC entry 3602 (class 2606 OID 16886)
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 3685 (class 2606 OID 17630)
-- Name: custom_field_values custom_field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT custom_field_values_pkey PRIMARY KEY (id);


--
-- TOC entry 3682 (class 2606 OID 17616)
-- Name: custom_fields custom_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_fields
    ADD CONSTRAINT custom_fields_pkey PRIMARY KEY (id);


--
-- TOC entry 3687 (class 2606 OID 17683)
-- Name: custom_objects custom_objects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_objects
    ADD CONSTRAINT custom_objects_pkey PRIMARY KEY (id);


--
-- TOC entry 3660 (class 2606 OID 17356)
-- Name: deal_stage_history deal_stage_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deal_stage_history
    ADD CONSTRAINT deal_stage_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3646 (class 2606 OID 17171)
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- TOC entry 3628 (class 2606 OID 17073)
-- Name: email_address_types email_address_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_address_types
    ADD CONSTRAINT email_address_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3673 (class 2606 OID 17495)
-- Name: email_addresses email_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_addresses
    ADD CONSTRAINT email_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 3581 (class 2606 OID 16743)
-- Name: industries industries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_pkey PRIMARY KEY (id);


--
-- TOC entry 3596 (class 2606 OID 16852)
-- Name: lead_statuses lead_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_statuses
    ADD CONSTRAINT lead_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 3600 (class 2606 OID 16868)
-- Name: lead_temperatures lead_temperatures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_temperatures
    ADD CONSTRAINT lead_temperatures_pkey PRIMARY KEY (id);


--
-- TOC entry 3650 (class 2606 OID 17211)
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- TOC entry 3614 (class 2606 OID 17009)
-- Name: marketing_asset_types marketing_asset_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_asset_types
    ADD CONSTRAINT marketing_asset_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3663 (class 2606 OID 17382)
-- Name: marketing_assets marketing_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_assets
    ADD CONSTRAINT marketing_assets_pkey PRIMARY KEY (id);


--
-- TOC entry 3607 (class 2606 OID 16906)
-- Name: marketing_source_types marketing_source_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_source_types
    ADD CONSTRAINT marketing_source_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3610 (class 2606 OID 16921)
-- Name: marketing_sources marketing_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sources
    ADD CONSTRAINT marketing_sources_pkey PRIMARY KEY (id);


--
-- TOC entry 3562 (class 2606 OID 16648)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 3560 (class 2606 OID 16637)
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- TOC entry 3626 (class 2606 OID 17057)
-- Name: phone_number_types phone_number_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_number_types
    ADD CONSTRAINT phone_number_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3671 (class 2606 OID 17454)
-- Name: phone_numbers phone_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT phone_numbers_pkey PRIMARY KEY (id);


--
-- TOC entry 3575 (class 2606 OID 16707)
-- Name: pipelines pipelines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_pkey PRIMARY KEY (id);


--
-- TOC entry 3680 (class 2606 OID 17575)
-- Name: social_media_accounts social_media_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_accounts
    ADD CONSTRAINT social_media_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 3638 (class 2606 OID 17105)
-- Name: social_media_types social_media_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_types
    ADD CONSTRAINT social_media_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3577 (class 2606 OID 16724)
-- Name: stages stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT stages_pkey PRIMARY KEY (id);


--
-- TOC entry 3589 (class 2606 OID 16799)
-- Name: task_types task_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_types
    ADD CONSTRAINT task_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3653 (class 2606 OID 17257)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 3568 (class 2606 OID 16679)
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- TOC entry 3656 (class 2606 OID 17320)
-- Name: territories territories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territories
    ADD CONSTRAINT territories_pkey PRIMARY KEY (id);


--
-- TOC entry 3622 (class 2606 OID 17041)
-- Name: territory_types territory_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territory_types
    ADD CONSTRAINT territory_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3572 (class 2606 OID 16691)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3658 (class 2606 OID 17338)
-- Name: user_territories user_territories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_territories
    ADD CONSTRAINT user_territories_pkey PRIMARY KEY (territory_id, user_id);


--
-- TOC entry 3642 (class 2606 OID 17151)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3644 (class 2606 OID 17149)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3633 (class 1259 OID 17096)
-- Name: idx_address_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_address_types_code ON public.address_types USING btree (code);


--
-- TOC entry 3634 (class 1259 OID 17095)
-- Name: idx_address_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_address_types_deleted_at ON public.address_types USING btree (deleted_at);


--
-- TOC entry 3677 (class 1259 OID 17566)
-- Name: idx_addresses_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_addresses_deleted_at ON public.addresses USING btree (deleted_at);


--
-- TOC entry 3617 (class 1259 OID 17031)
-- Name: idx_communication_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_communication_types_code ON public.communication_types USING btree (code);


--
-- TOC entry 3618 (class 1259 OID 17032)
-- Name: idx_communication_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_communication_types_deleted_at ON public.communication_types USING btree (deleted_at);


--
-- TOC entry 3666 (class 1259 OID 17432)
-- Name: idx_communications_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_communications_deleted_at ON public.communications USING btree (deleted_at);


--
-- TOC entry 3592 (class 1259 OID 16842)
-- Name: idx_companies_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_deleted_at ON public.companies USING btree (deleted_at);


--
-- TOC entry 3584 (class 1259 OID 16766)
-- Name: idx_company_sizes_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_company_sizes_code ON public.company_sizes USING btree (code);


--
-- TOC entry 3585 (class 1259 OID 16765)
-- Name: idx_company_sizes_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_sizes_deleted_at ON public.company_sizes USING btree (deleted_at);


--
-- TOC entry 3603 (class 1259 OID 16897)
-- Name: idx_contacts_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_deleted_at ON public.contacts USING btree (deleted_at);


--
-- TOC entry 3683 (class 1259 OID 17622)
-- Name: idx_custom_fields_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_fields_deleted_at ON public.custom_fields USING btree (deleted_at);


--
-- TOC entry 3688 (class 1259 OID 17689)
-- Name: idx_custom_objects_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_objects_deleted_at ON public.custom_objects USING btree (deleted_at);


--
-- TOC entry 3647 (class 1259 OID 17202)
-- Name: idx_deals_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_deleted_at ON public.deals USING btree (deleted_at);


--
-- TOC entry 3629 (class 1259 OID 17080)
-- Name: idx_email_address_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_email_address_types_code ON public.email_address_types USING btree (code);


--
-- TOC entry 3630 (class 1259 OID 17079)
-- Name: idx_email_address_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_address_types_deleted_at ON public.email_address_types USING btree (deleted_at);


--
-- TOC entry 3674 (class 1259 OID 17526)
-- Name: idx_email_addresses_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_addresses_deleted_at ON public.email_addresses USING btree (deleted_at);


--
-- TOC entry 3578 (class 1259 OID 16749)
-- Name: idx_industries_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_industries_code ON public.industries USING btree (code);


--
-- TOC entry 3579 (class 1259 OID 16750)
-- Name: idx_industries_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_industries_deleted_at ON public.industries USING btree (deleted_at);


--
-- TOC entry 3593 (class 1259 OID 16859)
-- Name: idx_lead_statuses_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_lead_statuses_code ON public.lead_statuses USING btree (code);


--
-- TOC entry 3594 (class 1259 OID 16858)
-- Name: idx_lead_statuses_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lead_statuses_deleted_at ON public.lead_statuses USING btree (deleted_at);


--
-- TOC entry 3597 (class 1259 OID 16874)
-- Name: idx_lead_temperatures_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_lead_temperatures_code ON public.lead_temperatures USING btree (code);


--
-- TOC entry 3598 (class 1259 OID 16875)
-- Name: idx_lead_temperatures_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lead_temperatures_deleted_at ON public.lead_temperatures USING btree (deleted_at);


--
-- TOC entry 3648 (class 1259 OID 17247)
-- Name: idx_leads_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leads_deleted_at ON public.leads USING btree (deleted_at);


--
-- TOC entry 3611 (class 1259 OID 17016)
-- Name: idx_marketing_asset_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_marketing_asset_types_code ON public.marketing_asset_types USING btree (code);


--
-- TOC entry 3612 (class 1259 OID 17015)
-- Name: idx_marketing_asset_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_asset_types_deleted_at ON public.marketing_asset_types USING btree (deleted_at);


--
-- TOC entry 3661 (class 1259 OID 17393)
-- Name: idx_marketing_assets_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_assets_deleted_at ON public.marketing_assets USING btree (deleted_at);


--
-- TOC entry 3604 (class 1259 OID 16912)
-- Name: idx_marketing_source_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_marketing_source_types_code ON public.marketing_source_types USING btree (code);


--
-- TOC entry 3605 (class 1259 OID 16913)
-- Name: idx_marketing_source_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_source_types_deleted_at ON public.marketing_source_types USING btree (deleted_at);


--
-- TOC entry 3608 (class 1259 OID 16932)
-- Name: idx_marketing_sources_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marketing_sources_deleted_at ON public.marketing_sources USING btree (deleted_at);


--
-- TOC entry 3623 (class 1259 OID 17064)
-- Name: idx_phone_number_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_phone_number_types_code ON public.phone_number_types USING btree (code);


--
-- TOC entry 3624 (class 1259 OID 17063)
-- Name: idx_phone_number_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_phone_number_types_deleted_at ON public.phone_number_types USING btree (deleted_at);


--
-- TOC entry 3669 (class 1259 OID 17485)
-- Name: idx_phone_numbers_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_phone_numbers_deleted_at ON public.phone_numbers USING btree (deleted_at);


--
-- TOC entry 3573 (class 1259 OID 16713)
-- Name: idx_pipelines_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pipelines_deleted_at ON public.pipelines USING btree (deleted_at);


--
-- TOC entry 3678 (class 1259 OID 17606)
-- Name: idx_social_media_accounts_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_media_accounts_deleted_at ON public.social_media_accounts USING btree (deleted_at);


--
-- TOC entry 3635 (class 1259 OID 17112)
-- Name: idx_social_media_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_social_media_types_code ON public.social_media_types USING btree (code);


--
-- TOC entry 3636 (class 1259 OID 17111)
-- Name: idx_social_media_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_media_types_deleted_at ON public.social_media_types USING btree (deleted_at);


--
-- TOC entry 3586 (class 1259 OID 16806)
-- Name: idx_task_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_task_types_code ON public.task_types USING btree (code);


--
-- TOC entry 3587 (class 1259 OID 16805)
-- Name: idx_task_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_task_types_deleted_at ON public.task_types USING btree (deleted_at);


--
-- TOC entry 3651 (class 1259 OID 17288)
-- Name: idx_tasks_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_deleted_at ON public.tasks USING btree (deleted_at);


--
-- TOC entry 3565 (class 1259 OID 16680)
-- Name: idx_tenants_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_deleted_at ON public.tenants USING btree (deleted_at);


--
-- TOC entry 3566 (class 1259 OID 16681)
-- Name: idx_tenants_subdomain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_tenants_subdomain ON public.tenants USING btree (subdomain);


--
-- TOC entry 3654 (class 1259 OID 17331)
-- Name: idx_territories_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_territories_deleted_at ON public.territories USING btree (deleted_at);


--
-- TOC entry 3619 (class 1259 OID 17048)
-- Name: idx_territory_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_territory_types_code ON public.territory_types USING btree (code);


--
-- TOC entry 3620 (class 1259 OID 17047)
-- Name: idx_territory_types_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_territory_types_deleted_at ON public.territory_types USING btree (deleted_at);


--
-- TOC entry 3569 (class 1259 OID 16698)
-- Name: idx_user_roles_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_user_roles_code ON public.user_roles USING btree (code);


--
-- TOC entry 3570 (class 1259 OID 16697)
-- Name: idx_user_roles_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_roles_deleted_at ON public.user_roles USING btree (deleted_at);


--
-- TOC entry 3639 (class 1259 OID 17311)
-- Name: idx_users_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at);


--
-- TOC entry 3640 (class 1259 OID 17312)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3761 (class 2606 OID 17556)
-- Name: addresses fk_address_types_addresses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT fk_address_types_addresses FOREIGN KEY (type_id) REFERENCES public.address_types(id);


--
-- TOC entry 3748 (class 2606 OID 17427)
-- Name: communications fk_communication_types_communications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_communication_types_communications FOREIGN KEY (type_id) REFERENCES public.communication_types(id);


--
-- TOC entry 3754 (class 2606 OID 17441)
-- Name: communication_attachments fk_communications_attachments; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communication_attachments
    ADD CONSTRAINT fk_communications_attachments FOREIGN KEY (communication_id) REFERENCES public.communications(id);


--
-- TOC entry 3768 (class 2606 OID 17641)
-- Name: custom_field_values fk_communications_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_communications_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.communications(id) ON DELETE CASCADE;


--
-- TOC entry 3749 (class 2606 OID 17417)
-- Name: communications fk_communications_tenant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_communications_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3778 (class 2606 OID 17708)
-- Name: activity_logs fk_companies_activity_logs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_companies_activity_logs FOREIGN KEY (entity_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 3703 (class 2606 OID 16887)
-- Name: contacts fk_companies_contacts; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT fk_companies_contacts FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3769 (class 2606 OID 17636)
-- Name: custom_field_values fk_companies_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_companies_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 3720 (class 2606 OID 17197)
-- Name: deals fk_companies_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_companies_deals FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3726 (class 2606 OID 17222)
-- Name: leads fk_companies_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_companies_leads FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 3698 (class 2606 OID 16827)
-- Name: companies fk_company_sizes_companies; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT fk_company_sizes_companies FOREIGN KEY (size_id) REFERENCES public.company_sizes(id);


--
-- TOC entry 3779 (class 2606 OID 17703)
-- Name: activity_logs fk_contacts_activity_logs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_contacts_activity_logs FOREIGN KEY (entity_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- TOC entry 3762 (class 2606 OID 17536)
-- Name: addresses fk_contacts_addresses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT fk_contacts_addresses FOREIGN KEY (entity_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- TOC entry 3750 (class 2606 OID 17407)
-- Name: communications fk_contacts_communications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_contacts_communications FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- TOC entry 3770 (class 2606 OID 17631)
-- Name: custom_field_values fk_contacts_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_contacts_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- TOC entry 3721 (class 2606 OID 17187)
-- Name: deals fk_contacts_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_contacts_deals FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- TOC entry 3758 (class 2606 OID 17506)
-- Name: email_addresses fk_contacts_email_addresses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_addresses
    ADD CONSTRAINT fk_contacts_email_addresses FOREIGN KEY (entity_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- TOC entry 3727 (class 2606 OID 17242)
-- Name: leads fk_contacts_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_contacts_leads FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- TOC entry 3755 (class 2606 OID 17460)
-- Name: phone_numbers fk_contacts_phone_numbers; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT fk_contacts_phone_numbers FOREIGN KEY (entity_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- TOC entry 3764 (class 2606 OID 17581)
-- Name: social_media_accounts fk_contacts_social_media_accounts; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_accounts
    ADD CONSTRAINT fk_contacts_social_media_accounts FOREIGN KEY (entity_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- TOC entry 3771 (class 2606 OID 17666)
-- Name: custom_field_values fk_custom_fields_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_custom_fields_values FOREIGN KEY (field_id) REFERENCES public.custom_fields(id);


--
-- TOC entry 3743 (class 2606 OID 17367)
-- Name: deal_stage_history fk_deal_stage_history_from_stage; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deal_stage_history
    ADD CONSTRAINT fk_deal_stage_history_from_stage FOREIGN KEY (from_stage_id) REFERENCES public.stages(id);


--
-- TOC entry 3780 (class 2606 OID 17713)
-- Name: activity_logs fk_deals_activity_logs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_deals_activity_logs FOREIGN KEY (entity_id) REFERENCES public.deals(id) ON DELETE CASCADE;


--
-- TOC entry 3751 (class 2606 OID 17402)
-- Name: communications fk_deals_communications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_deals_communications FOREIGN KEY (deal_id) REFERENCES public.deals(id);


--
-- TOC entry 3772 (class 2606 OID 17661)
-- Name: custom_field_values fk_deals_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_deals_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.deals(id) ON DELETE CASCADE;


--
-- TOC entry 3744 (class 2606 OID 17362)
-- Name: deal_stage_history fk_deals_stage_history; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deal_stage_history
    ADD CONSTRAINT fk_deals_stage_history FOREIGN KEY (deal_id) REFERENCES public.deals(id);


--
-- TOC entry 3733 (class 2606 OID 17258)
-- Name: tasks fk_deals_tasks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_deals_tasks FOREIGN KEY (deal_id) REFERENCES public.deals(id);


--
-- TOC entry 3759 (class 2606 OID 17521)
-- Name: email_addresses fk_email_address_types_email_addresses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_addresses
    ADD CONSTRAINT fk_email_address_types_email_addresses FOREIGN KEY (type_id) REFERENCES public.email_address_types(id);


--
-- TOC entry 3699 (class 2606 OID 16837)
-- Name: companies fk_industries_companies; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT fk_industries_companies FOREIGN KEY (industry_id) REFERENCES public.industries(id);


--
-- TOC entry 3728 (class 2606 OID 17212)
-- Name: leads fk_lead_statuses_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_lead_statuses_leads FOREIGN KEY (status_id) REFERENCES public.lead_statuses(id);


--
-- TOC entry 3729 (class 2606 OID 17227)
-- Name: leads fk_lead_temperatures_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_lead_temperatures_leads FOREIGN KEY (temperature_id) REFERENCES public.lead_temperatures(id);


--
-- TOC entry 3781 (class 2606 OID 17718)
-- Name: activity_logs fk_leads_activity_logs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_leads_activity_logs FOREIGN KEY (entity_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- TOC entry 3752 (class 2606 OID 17422)
-- Name: communications fk_leads_communications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_leads_communications FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- TOC entry 3773 (class 2606 OID 17671)
-- Name: custom_field_values fk_leads_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_leads_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- TOC entry 3734 (class 2606 OID 17268)
-- Name: tasks fk_leads_tasks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_leads_tasks FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- TOC entry 3746 (class 2606 OID 17388)
-- Name: marketing_assets fk_marketing_asset_types_marketing_assets; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_assets
    ADD CONSTRAINT fk_marketing_asset_types_marketing_assets FOREIGN KEY (type_id) REFERENCES public.marketing_asset_types(id);


--
-- TOC entry 3774 (class 2606 OID 17651)
-- Name: custom_field_values fk_marketing_assets_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_marketing_assets_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.marketing_assets(id) ON DELETE CASCADE;


--
-- TOC entry 3706 (class 2606 OID 16927)
-- Name: marketing_sources fk_marketing_source_types_marketing_sources; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sources
    ADD CONSTRAINT fk_marketing_source_types_marketing_sources FOREIGN KEY (type_id) REFERENCES public.marketing_source_types(id);


--
-- TOC entry 3775 (class 2606 OID 17646)
-- Name: custom_field_values fk_marketing_sources_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_marketing_sources_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.marketing_sources(id) ON DELETE CASCADE;


--
-- TOC entry 3730 (class 2606 OID 17217)
-- Name: leads fk_marketing_sources_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_marketing_sources_leads FOREIGN KEY (marketing_source_id) REFERENCES public.marketing_sources(id);


--
-- TOC entry 3756 (class 2606 OID 17455)
-- Name: phone_numbers fk_phone_number_types_phone_numbers; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT fk_phone_number_types_phone_numbers FOREIGN KEY (type_id) REFERENCES public.phone_number_types(id);


--
-- TOC entry 3722 (class 2606 OID 17172)
-- Name: deals fk_pipelines_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_pipelines_deals FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id);


--
-- TOC entry 3693 (class 2606 OID 16725)
-- Name: stages fk_pipelines_stages; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT fk_pipelines_stages FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id);


--
-- TOC entry 3765 (class 2606 OID 17576)
-- Name: social_media_accounts fk_social_media_types_social_media_accounts; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_accounts
    ADD CONSTRAINT fk_social_media_types_social_media_accounts FOREIGN KEY (type_id) REFERENCES public.social_media_types(id);


--
-- TOC entry 3723 (class 2606 OID 17182)
-- Name: deals fk_stages_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_stages_deals FOREIGN KEY (stage_id) REFERENCES public.stages(id);


--
-- TOC entry 3745 (class 2606 OID 17357)
-- Name: deal_stage_history fk_stages_stage_history; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deal_stage_history
    ADD CONSTRAINT fk_stages_stage_history FOREIGN KEY (to_stage_id) REFERENCES public.stages(id);


--
-- TOC entry 3735 (class 2606 OID 17278)
-- Name: tasks fk_task_types_tasks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_task_types_tasks FOREIGN KEY (type_id) REFERENCES public.task_types(id);


--
-- TOC entry 3715 (class 2606 OID 17306)
-- Name: users fk_tasks_created_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_tasks_created_by_user FOREIGN KEY (created_by) REFERENCES public.tasks(id);


--
-- TOC entry 3776 (class 2606 OID 17656)
-- Name: custom_field_values fk_tasks_custom_field_values; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT fk_tasks_custom_field_values FOREIGN KEY (entity_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- TOC entry 3736 (class 2606 OID 17283)
-- Name: tasks fk_tasks_tenant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_tasks_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3713 (class 2606 OID 17090)
-- Name: address_types fk_tenants_address_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address_types
    ADD CONSTRAINT fk_tenants_address_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3763 (class 2606 OID 17561)
-- Name: addresses fk_tenants_addresses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT fk_tenants_addresses FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3709 (class 2606 OID 17026)
-- Name: communication_types fk_tenants_communication_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communication_types
    ADD CONSTRAINT fk_tenants_communication_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3700 (class 2606 OID 16832)
-- Name: companies fk_tenants_companies; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT fk_tenants_companies FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3696 (class 2606 OID 16760)
-- Name: company_sizes fk_tenants_company_sizes; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_sizes
    ADD CONSTRAINT fk_tenants_company_sizes FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3704 (class 2606 OID 16892)
-- Name: contacts fk_tenants_contacts; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT fk_tenants_contacts FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3767 (class 2606 OID 17617)
-- Name: custom_fields fk_tenants_custom_fields; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_fields
    ADD CONSTRAINT fk_tenants_custom_fields FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3777 (class 2606 OID 17684)
-- Name: custom_objects fk_tenants_custom_objects; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_objects
    ADD CONSTRAINT fk_tenants_custom_objects FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3724 (class 2606 OID 17177)
-- Name: deals fk_tenants_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_tenants_deals FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3712 (class 2606 OID 17074)
-- Name: email_address_types fk_tenants_email_address_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_address_types
    ADD CONSTRAINT fk_tenants_email_address_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3760 (class 2606 OID 17501)
-- Name: email_addresses fk_tenants_email_addresses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_addresses
    ADD CONSTRAINT fk_tenants_email_addresses FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3695 (class 2606 OID 16744)
-- Name: industries fk_tenants_industries; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT fk_tenants_industries FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3701 (class 2606 OID 16853)
-- Name: lead_statuses fk_tenants_lead_statuses; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_statuses
    ADD CONSTRAINT fk_tenants_lead_statuses FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3702 (class 2606 OID 16869)
-- Name: lead_temperatures fk_tenants_lead_temperatures; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_temperatures
    ADD CONSTRAINT fk_tenants_lead_temperatures FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3731 (class 2606 OID 17237)
-- Name: leads fk_tenants_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_tenants_leads FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3708 (class 2606 OID 17010)
-- Name: marketing_asset_types fk_tenants_marketing_asset_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_asset_types
    ADD CONSTRAINT fk_tenants_marketing_asset_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3747 (class 2606 OID 17383)
-- Name: marketing_assets fk_tenants_marketing_assets; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_assets
    ADD CONSTRAINT fk_tenants_marketing_assets FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3705 (class 2606 OID 16907)
-- Name: marketing_source_types fk_tenants_marketing_source_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_source_types
    ADD CONSTRAINT fk_tenants_marketing_source_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3707 (class 2606 OID 16922)
-- Name: marketing_sources fk_tenants_marketing_sources; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_sources
    ADD CONSTRAINT fk_tenants_marketing_sources FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3711 (class 2606 OID 17058)
-- Name: phone_number_types fk_tenants_phone_number_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_number_types
    ADD CONSTRAINT fk_tenants_phone_number_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3757 (class 2606 OID 17470)
-- Name: phone_numbers fk_tenants_phone_numbers; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT fk_tenants_phone_numbers FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3692 (class 2606 OID 16708)
-- Name: pipelines fk_tenants_pipelines; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT fk_tenants_pipelines FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3766 (class 2606 OID 17601)
-- Name: social_media_accounts fk_tenants_social_media_accounts; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_accounts
    ADD CONSTRAINT fk_tenants_social_media_accounts FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3714 (class 2606 OID 17106)
-- Name: social_media_types fk_tenants_social_media_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_media_types
    ADD CONSTRAINT fk_tenants_social_media_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3694 (class 2606 OID 16730)
-- Name: stages fk_tenants_stages; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT fk_tenants_stages FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3697 (class 2606 OID 16800)
-- Name: task_types fk_tenants_task_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_types
    ADD CONSTRAINT fk_tenants_task_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3739 (class 2606 OID 17321)
-- Name: territories fk_tenants_territories; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territories
    ADD CONSTRAINT fk_tenants_territories FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3710 (class 2606 OID 17042)
-- Name: territory_types fk_tenants_territory_types; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territory_types
    ADD CONSTRAINT fk_tenants_territory_types FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3691 (class 2606 OID 16692)
-- Name: user_roles fk_tenants_user_roles; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_tenants_user_roles FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3716 (class 2606 OID 17301)
-- Name: users fk_tenants_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_tenants_users FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 3740 (class 2606 OID 17326)
-- Name: territories fk_territory_types_territories; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territories
    ADD CONSTRAINT fk_territory_types_territories FOREIGN KEY (type_id) REFERENCES public.territory_types(id);


--
-- TOC entry 3717 (class 2606 OID 17296)
-- Name: users fk_user_roles_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_user_roles_users FOREIGN KEY (role_id) REFERENCES public.user_roles(id);


--
-- TOC entry 3741 (class 2606 OID 17339)
-- Name: user_territories fk_user_territories_territory; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_territories
    ADD CONSTRAINT fk_user_territories_territory FOREIGN KEY (territory_id) REFERENCES public.territories(id);


--
-- TOC entry 3742 (class 2606 OID 17344)
-- Name: user_territories fk_user_territories_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_territories
    ADD CONSTRAINT fk_user_territories_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3782 (class 2606 OID 17698)
-- Name: activity_logs fk_users_activity_logs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_users_activity_logs FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3725 (class 2606 OID 17192)
-- Name: deals fk_users_assigned_deals; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT fk_users_assigned_deals FOREIGN KEY (assigned_user_id) REFERENCES public.users(id);


--
-- TOC entry 3732 (class 2606 OID 17232)
-- Name: leads fk_users_assigned_leads; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_users_assigned_leads FOREIGN KEY (assigned_user_id) REFERENCES public.users(id);


--
-- TOC entry 3737 (class 2606 OID 17273)
-- Name: tasks fk_users_assigned_tasks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_users_assigned_tasks FOREIGN KEY (assigned_user_id) REFERENCES public.users(id);


--
-- TOC entry 3753 (class 2606 OID 17412)
-- Name: communications fk_users_communications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_users_communications FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3738 (class 2606 OID 17263)
-- Name: tasks fk_users_created_tasks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_users_created_tasks FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3718 (class 2606 OID 17152)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.user_roles(id);


--
-- TOC entry 3719 (class 2606 OID 17157)
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


-- Completed on 2025-08-18 10:55:26 HKT

--
-- PostgreSQL database dump complete
--

