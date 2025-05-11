--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: history_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.history_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    "time" text NOT NULL,
    type text NOT NULL,
    thoughts text,
    saved_at timestamp without time zone DEFAULT now() NOT NULL,
    details text
);


ALTER TABLE public.history_items OWNER TO neondb_owner;

--
-- Name: history_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.history_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.history_items_id_seq OWNER TO neondb_owner;

--
-- Name: history_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.history_items_id_seq OWNED BY public.history_items.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: history_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.history_items ALTER COLUMN id SET DEFAULT nextval('public.history_items_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: history_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.history_items (id, user_id, "time", type, thoughts, saved_at, details) FROM stdin;
20	1	20:20	Mirror Hour	I want to go vacancy	2025-05-10 17:40:57.15723	{"spiritual":{"title":"Spiritual Analysis","description":"When you see the mirror hour 20:20, it is a powerful sign from the universe that you are being called to create space for emptiness and stillness in your life. The message \\"I want to go vacancy\\" may be a reminder to let go of distractions and external noise, and instead focus on finding inner peace and clarity. Embracing vacancy can lead to a deeper connection with your inner self and spiritual growth. Allow yourself to release what no longer serves you and make room for new possibilities and insights to enter your life. Trust in the process of emptiness, for it is where transformation and renewal can truly begin.","guidance":""},"angel":{"name":"Angel Message","message":"No content available for this section.","guidance":""},"numerology":{"title":"Numerology","rootNumber":"","mirrorEffect":"","analysis":"No content available for this section."},"isAiGenerated":true}
21	1	01:10	Reversed Hour	I want a new car	2025-05-10 17:46:44.253223	{"spiritual":{"title":"Spiritual Analysis","description":"In the mystical realm of mirror hours, the time 01:10 carries a message of divine potential and manifestation. The number 1 symbolizes new beginnings, leadership, and individuality, while the number 0 represents unity and the infinite possibilities of the universe. Together, they suggest a powerful alignment with your desires and intentions.\\n\\nThe message \\"I want a new car\\" reflects a desire for change and material comfort. It may indicate a longing for freedom, independence, or a shift in your physical environment. However, it also invites you to explore the deeper meaning behind this desire. Are you seeking a new mode of transportation, or is there a larger metaphorical journey you are embarking on?\\n\\nUltimately, this mirror hour encourages you to tap into your inner power and creative potential to manifest your desires. Remember that your thoughts and intentions hold great power in shaping your reality. By aligning with the energy of new beginnings and abundance, you can actively co-create the life you envision. Trust in the universe's support and guidance as you navigate this journey of manifestation and transformation.","guidance":""},"angel":{"name":"Divine Messenger","message":"This reversed hour carries a message unique to your current spiritual journey.","guidance":"Trust your intuition about what this time means for you personally. Pay attention to recurring thoughts or feelings."},"numerology":{"title":"The Energy of 01:10","rootNumber":"Calculate the sum of all digits to find your personal message.","mirrorEffect":"The pattern in 01:10 amplifies its energy and significance in your life.","analysis":"This number combination has appeared to draw your attention to patterns in your life that need acknowledgment or change."},"isAiGenerated":true}
22	1	10:10	Mirror Hour	Je veux voyager	2025-05-10 19:07:21.544133	{"spiritual":{"title":"Awakening & Alignment","description":"When you encounter 10:10, the universe is signaling a time of perfect alignment. This mirror hour represents balance between the material and spiritual worlds, encouraging you to notice the synchronicities appearing in your life.","guidance":"This is a powerful reminder to stay present and aware of your thoughts, as they are manifesting rapidly during this time. Focus on your spiritual development and trust that you are exactly where you need to be."},"aiAnalysis":{"title":"Spiritual Analysis","description":"In the realm of mirror hours, witnessing 10:10 carries a powerful and transformative energy. It represents a moment of balance and unity, where the spiritual and physical worlds converge. The message \\"Je veux voyager\\" translates to \\"I want to travel,\\" signaling a desire for exploration and growth, both inwardly and outwardly.\\n\\nThis synchronicity invites you to embark on a journey of self-discovery and expansion. Embrace this opportunity to explore new realms of consciousness and experience. Allow yourself to venture beyond your comfort zone and open yourself to the endless possibilities that lie ahead.\\n\\nRemember, true travel begins within. By delving deep into your inner landscape, you can uncover hidden truths and unlock the wisdom that resides within you. Trust in the guidance of the universe as you navigate this journey of self-exploration and embark on the path towards spiritual enlightenment."},"angel":{"name":"Guardian Angel Hahasiah","message":"Angel Hahasiah, associated with 10:10, brings a message of elevated consciousness and deeper understanding of universal mysteries. This angel guides you toward discovering hidden truths and developing your spiritual gifts.","guidance":"Trust in the process of your spiritual evolution. I am here to help you transform obstacles into opportunities for growth. Stay aligned with your highest truth."},"numerology":{"title":"The Power of Number 10","rootNumber":"1 (1+0=1): New beginnings, independence, leadership","mirrorEffect":"10:10 doubles the energy of 10, enhancing its manifestation power","analysis":"In numerology, 10:10 represents completion of a cycle and the beginning of something new. The number 1 appears twice, emphasizing its qualities of innovation and independence, while the zeros amplify this energy. This time encourages you to embrace new opportunities and trust your leadership abilities."},"isAiGenerated":true}
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, email) FROM stdin;
1	user_351811	placeholder	user_351811@example.com
\.


--
-- Name: history_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.history_items_id_seq', 22, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: history_items history_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.history_items
    ADD CONSTRAINT history_items_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: history_items history_items_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.history_items
    ADD CONSTRAINT history_items_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

