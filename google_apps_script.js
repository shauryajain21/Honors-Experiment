// === CONFIGURATION ===
const SUPABASE_URL = "https://pmnblzjhoqtmuezjzgmz.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbmJsempob3F0bXVlemp6Z216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MTQyNjYsImV4cCI6MjA4NzM5MDI2Nn0.c7tHwl1dQ_-gH3Dka4AnIkOyjS1MYG5_n9_HYzzCoYM";

function fetchSupabase(table, select, order) {
  const url = `${SUPABASE_URL}/${table}?select=${encodeURIComponent(select)}&order=${order || "created_at.desc"}`;
  const response = UrlFetchApp.fetch(url, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
    },
  });
  return JSON.parse(response.getContentText());
}

function refreshAllData() {
  refreshSessions();
  refreshTrials();
  refreshTraining();
  SpreadsheetApp.getActive().toast("Data refreshed from Supabase!", "Done", 3);
}

function refreshSessions() {
  const data = fetchSupabase(
    "experiment_sessions",
    "sona_id,red_jar_percentage,green_jar_percentage,red_jar_initial_probability,red_jar_initial_confidence,green_jar_initial_probability,green_jar_initial_confidence,experiment_start_time,experiment_end_time,demographics_gender,demographics_academic_year,demographics_major,demographics_minor,demographics_strategy,created_at"
  );

  const sheet = getOrCreateSheet("Sessions");
  sheet.clear();

  const headers = [
    "SONA ID", "Red Jar %", "Green Jar %",
    "Red Initial Prob", "Red Initial Conf",
    "Green Initial Prob", "Green Initial Conf",
    "Start Time", "End Time",
    "Gender", "Year", "Major", "Minor", "Strategy",
    "Created At"
  ];
  sheet.appendRow(headers);
  styleHeader(sheet, headers.length);

  data.forEach(function(s) {
    sheet.appendRow([
      s.sona_id, s.red_jar_percentage, s.green_jar_percentage,
      s.red_jar_initial_probability, s.red_jar_initial_confidence,
      s.green_jar_initial_probability, s.green_jar_initial_confidence,
      s.experiment_start_time, s.experiment_end_time,
      s.demographics_gender, s.demographics_academic_year,
      s.demographics_major, s.demographics_minor, s.demographics_strategy,
      s.created_at
    ]);
  });

  sheet.setFrozenRows(1);
  autoResize(sheet, headers.length);
}

function refreshTrials() {
  const data = fetchSupabase(
    "experiment_trials",
    "sona_id,phase,trial_number,jar_type,jar_percentage,drawn_ball,ball_sequence,estimated_probability,confidence,reaction_time,timestamp",
    "sona_id.asc,phase.asc,trial_number.asc"
  );

  const sheet = getOrCreateSheet("Experiment Trials");
  sheet.clear();

  const headers = [
    "SONA ID", "Phase", "Trial #", "Jar Type", "Jar %",
    "Drawn Ball", "Ball Sequence", "Estimated Probability",
    "Confidence (0-10)", "Reaction Time (ms)", "Timestamp"
  ];
  sheet.appendRow(headers);
  styleHeader(sheet, headers.length);

  data.forEach(function(t) {
    var seq = "";
    if (t.ball_sequence && t.ball_sequence.length > 0) {
      seq = t.ball_sequence.join(", ");
    }
    sheet.appendRow([
      t.sona_id, t.phase, t.trial_number, t.jar_type, t.jar_percentage,
      t.drawn_ball, seq, t.estimated_probability,
      t.confidence, t.reaction_time, t.timestamp
    ]);
  });

  sheet.setFrozenRows(1);
  autoResize(sheet, headers.length);
}

function refreshTraining() {
  const data = fetchSupabase(
    "training_trials",
    "sona_id,trial_number,sample_balls,correct_jar,incorrect_jar,selected_jar,is_correct,timestamp",
    "sona_id.asc,trial_number.asc"
  );

  const sheet = getOrCreateSheet("Training Trials");
  sheet.clear();

  const headers = [
    "SONA ID", "Trial #", "Sample Balls", "Correct Jar %",
    "Incorrect Jar %", "Selected Jar %", "Correct?", "Timestamp"
  ];
  sheet.appendRow(headers);
  styleHeader(sheet, headers.length);

  data.forEach(function(t) {
    var balls = "";
    if (t.sample_balls && t.sample_balls.length > 0) {
      balls = t.sample_balls.join(", ");
    }
    sheet.appendRow([
      t.sona_id, t.trial_number, balls, t.correct_jar,
      t.incorrect_jar, t.selected_jar, t.is_correct ? "Yes" : "No",
      t.timestamp
    ]);
  });

  sheet.setFrozenRows(1);
  autoResize(sheet, headers.length);
}

// === HELPERS ===

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function styleHeader(sheet, numCols) {
  var range = sheet.getRange(1, 1, 1, numCols);
  range.setBackground("#57068C");
  range.setFontColor("#FFFFFF");
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
}

function autoResize(sheet, numCols) {
  for (var i = 1; i <= numCols; i++) {
    sheet.autoResizeColumn(i);
  }
}

// === MENU ===

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Experiment Data")
    .addItem("Refresh All Data", "refreshAllData")
    .addItem("Refresh Sessions Only", "refreshSessions")
    .addItem("Refresh Trials Only", "refreshTrials")
    .addItem("Refresh Training Only", "refreshTraining")
    .addToUi();
}
