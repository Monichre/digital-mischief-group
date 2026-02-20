-- Migration 015: Add pg_cron + pg_net dispatchers for scout and observe schedules

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configure these in Neon once per database:
-- ALTER DATABASE <database_name> SET app.base_url = 'https://your-daedalus-url.com';
-- ALTER DATABASE <database_name> SET app.cron_secret = '<same-value-as-CRON_SECRET-env-var>';

CREATE OR REPLACE FUNCTION dispatch_due_scouts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_url TEXT := NULLIF(current_setting('app.base_url', true), '');
  cron_secret TEXT := NULLIF(current_setting('app.cron_secret', true), '');
  due_count INTEGER := 0;
BEGIN
  IF to_regclass('public.scouts') IS NULL THEN
    RAISE NOTICE '[scheduler] dispatch_due_scouts skipped: scouts table not found';
    RETURN 0;
  END IF;

  IF base_url IS NULL OR cron_secret IS NULL THEN
    RAISE NOTICE '[scheduler] dispatch_due_scouts skipped: app.base_url or app.cron_secret not configured';
    RETURN 0;
  END IF;

  SELECT COUNT(*)
  INTO due_count
  FROM scouts
  WHERE is_active = TRUE
    AND schedule <> 'manual'
    AND (next_run_at IS NULL OR next_run_at <= NOW());

  IF due_count = 0 THEN
    RETURN 0;
  END IF;

  PERFORM net.http_post(
    url := base_url || '/api/scouts/run-scheduled',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', cron_secret
    ),
    body := jsonb_build_object(
      'trigger', 'pg_cron',
      'due_count', due_count
    )
  );

  RETURN due_count;
END;
$$;

CREATE OR REPLACE FUNCTION dispatch_due_monitors()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_url TEXT := NULLIF(current_setting('app.base_url', true), '');
  cron_secret TEXT := NULLIF(current_setting('app.cron_secret', true), '');
  due_count INTEGER := 0;
BEGIN
  IF to_regclass('public.monitors') IS NULL THEN
    RAISE NOTICE '[scheduler] dispatch_due_monitors skipped: monitors table not found';
    RETURN 0;
  END IF;

  IF base_url IS NULL OR cron_secret IS NULL THEN
    RAISE NOTICE '[scheduler] dispatch_due_monitors skipped: app.base_url or app.cron_secret not configured';
    RETURN 0;
  END IF;

  SELECT COUNT(*)
  INTO due_count
  FROM monitors
  WHERE (
      last_checked_at IS NULL
      OR last_checked_at <= NOW() - (check_interval_seconds || ' seconds')::interval
    );

  IF due_count = 0 THEN
    RETURN 0;
  END IF;

  PERFORM net.http_post(
    url := base_url || '/api/monitors/check-due',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', cron_secret
    ),
    body := jsonb_build_object(
      'trigger', 'pg_cron',
      'due_count', due_count
    )
  );

  RETURN due_count;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_stuck_runs()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cleaned_scout_runs INTEGER := 0;
  cleaned_radar_runs INTEGER := 0;
  cleaned_research_missions INTEGER := 0;
BEGIN
  IF to_regclass('public.sentinel_agent_runs') IS NOT NULL THEN
    UPDATE sentinel_agent_runs
    SET
      status = 'failed',
      completed_at = NOW(),
      error_message = COALESCE(error_message, 'Marked failed by scheduler cleanup after timeout')
    WHERE status = 'running'
      AND completed_at IS NULL
      AND created_at < NOW() - INTERVAL '45 minutes';

    GET DIAGNOSTICS cleaned_scout_runs = ROW_COUNT;
  END IF;

  IF to_regclass('public.radar_runs') IS NOT NULL THEN
    UPDATE radar_runs
    SET
      status = 'failed',
      completed_at = NOW(),
      error = COALESCE(error, 'Marked failed by scheduler cleanup after timeout')
    WHERE status = 'running'
      AND completed_at IS NULL
      AND started_at < NOW() - INTERVAL '45 minutes';

    GET DIAGNOSTICS cleaned_radar_runs = ROW_COUNT;
  END IF;

  IF to_regclass('public.research_missions') IS NOT NULL THEN
    UPDATE research_missions
    SET
      status = 'failed',
      completed_at = NOW(),
      error_message = COALESCE(error_message, 'Marked failed by scheduler cleanup after timeout'),
      updated_at = NOW()
    WHERE status = 'running'
      AND completed_at IS NULL
      AND created_at < NOW() - INTERVAL '45 minutes';

    GET DIAGNOSTICS cleaned_research_missions = ROW_COUNT;
  END IF;

  RETURN jsonb_build_object(
    'sentinel_agent_runs', cleaned_scout_runs,
    'radar_runs', cleaned_radar_runs,
    'research_missions', cleaned_research_missions
  );
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'dispatch-due-scouts-every-minute') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'dispatch-due-scouts-every-minute';
  END IF;

  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'dispatch-due-monitors-every-minute') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'dispatch-due-monitors-every-minute';
  END IF;

  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-stuck-runs-every-5-minutes') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'cleanup-stuck-runs-every-5-minutes';
  END IF;
END;
$$;

SELECT cron.schedule(
  'dispatch-due-scouts-every-minute',
  '* * * * *',
  $$SELECT dispatch_due_scouts();$$
);

SELECT cron.schedule(
  'dispatch-due-monitors-every-minute',
  '* * * * *',
  $$SELECT dispatch_due_monitors();$$
);

SELECT cron.schedule(
  'cleanup-stuck-runs-every-5-minutes',
  '*/5 * * * *',
  $$SELECT cleanup_stuck_runs();$$
);
