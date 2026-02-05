import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  type DevotionalDay = {
    dayNumber : Nat;
    title : Text;
    scripture : Text;
    action : Text;
    guidance : Text;
    reflection : Text;
  };

  type JournalEntry = {
    dayNumber : Nat;
    content : Text;
    linkedScriptures : [VerseReference];
  };

  type FastingSession = {
    goalHours : Nat;
    startTime : ?Time.Time;
    status : {
      #notStarted;
      #inProgress : { elapsed : Int };
      #completed;
    };
    reflectionJournal : Text;
    timestamp : Time.Time;
  };

  type FastHistory = {
    goalHours : Nat;
    startTime : Time.Time;
    endTime : Time.Time;
    reflectionJournal : Text;
    timestamp : Int;
  };

  type FastingContent = {
    description : Text;
    hourlyEncouragement : [Text];
    reflectionPrompt : Text;
    completionEncouragement : Text;
    scriptureReferences : [VerseReference];
  };

  type VerseReference = {
    book : Text;
    chapter : Nat;
    verseStart : Nat;
    verseEnd : Nat;
  };

  type BibleVerse = {
    book : Text;
    chapter : Nat;
    verse : Nat;
    text : Text;
  };

  type Bookmarks = {
    verse : BibleVerse;
    note : Text;
  };

  type Reminder = {
    time : Nat;
    enabled : Bool;
    message : Text;
  };

  type MinistryInfo = {
    missionStatement : Text;
    website : Text;
    email : Text;
    address : Text;
    supportLink : Text;
  };

  type UserData = {
    currentDay : Nat;
    journalEntries : Map.Map<Nat, JournalEntry>;
    reminders : Map.Map<Nat, Reminder>;
    fastingSessions : List.List<FastingSession>;
    fastHistory : List.List<FastHistory>;
    verseBookmarks : List.List<Bookmarks>;
    currentFastSession : ?FastingSession;
  };

  let devotionalDays = List.empty<DevotionalDay>();
  let bibleVerses = List.empty<BibleVerse>();
  var fastingContent : FastingContent = {
    description = "Biblical Fasting\n\n\"When you fast, do not look somber as the hypocrites do, for they disfigure their faces to show others they are fasting. Truly I tell you, they have received their reward in full. But when you fast, anoint your head and wash your face, so that it will not be obvious to others that you are fasting, but only to your Father, who is unseen. And your Father, who sees what is done in secret, will reward you.\" – Matthew 6:16–18\n\n\"Is this not the fast that I have chosen: to loose the bonds of wickedness, to undo the heavy burdens, to let the oppressed go free, and that you break every yoke?\" – Isaiah 58:6–9\n\n\"Even now, declares the Lord, return to me with all your heart, with fasting and weeping and mourning.\" – Joel 2:12\n\nFasting is a spiritual discipline that brings you closer to God. It's about hunger for God's presence rather than food. Abstain from physical nourishment to focus on spiritual connection through prayer, reflection, and obedience.";
    hourlyEncouragement = [
      "First hour just started, stay strong. Focus on your intent.",
      "Second hour, rely on God's strength. Study scripture.",
      "Third hour, increased physical hunger is possible. Pray specifically for needs.",
      "Fourth hour, journal your thoughts and experiences.",
      "Fifth hour, deeper sense of God's presence. Reflect inwardly.",
      "Sixth hour, pray for lasting transformation.",
    ];
    reflectionPrompt = "Reflect on your fasting experience. Record thoughts, prayers, revelations, and God's presence during this journey. Let this be a time of transformation and spiritual renewal.";
    completionEncouragement = "Congratulations on completing your fast! Your faith and persistence are inspiring. Trust God's rewards for your dedication and obedience. Continue to seek Him daily and let this experience shape your spiritual walk.";
    scriptureReferences = [
      { book = "Matthew"; chapter = 6; verseStart = 16; verseEnd = 18 },
      { book = "Isaiah"; chapter = 58; verseStart = 6; verseEnd = 9 },
      { book = "Joel"; chapter = 2; verseStart = 12; verseEnd = 12 },
    ];
  };
  let userDataMap = Map.empty<Principal, UserData>();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func getOrCreateUserData(caller : Principal) : UserData {
    switch (userDataMap.get(caller)) {
      case (?existing) { existing };
      case (null) {
        let newUserData : UserData = {
          currentDay = 1;
          journalEntries = Map.empty<Nat, JournalEntry>();
          reminders = Map.empty<Nat, Reminder>();
          fastingSessions = List.empty<FastingSession>();
          fastHistory = List.empty<FastHistory>();
          verseBookmarks = List.empty<Bookmarks>();
          currentFastSession = null;
        };
        userDataMap.add(caller, newUserData);
        newUserData;
      };
    };
  };

  public shared ({ caller }) func initializeDevotionalDays() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize devotional days");
    };

    let devotionalDaysArray : [DevotionalDay] = [
      {
        dayNumber = 1;
        title = "Pause for Purpose";
        scripture = "Psalm 37:7";
        action = "Today, take a break from your busy schedule. Spend 10 minutes in quiet reflection, asking God to guide your thoughts and actions.";
        guidance = "Set a daily reminder to spend quiet time with God and reflect on your goals and purpose. End your day with gratitude for His guidance.";
        reflection = "What did you feel or hear during your quiet time today? How can you incorporate this practice more into your life?";
      },
      {
        dayNumber = 2;
        title = "Faith Over Fear";
        scripture = "2 Timothy 1:7";
        action = "Identify an area where fear has been holding you back. Take a step forward in faith, trusting that God is with you.";
        guidance = "Remember that faith is a daily choice. Pray for courage and take action, even if it's a small step. God honors your efforts.";
        reflection = "What fears did you face today, and how did God help you overcome them? What steps of faith can you continue to take?";
      },
      {
        dayNumber = 3;
        title = "Trusting God's Timing";
        scripture = "Ecclesiastes 3:1";
        action = "Reflect on a situation where you're waiting for an answer or outcome. Surrender your timeline to God and trust His perfect timing.";
        guidance = "It's natural to feel anxious when things don't happen as quickly as you'd like. Remember, God's timing is always perfect.";
        reflection = "What can you do in the waiting season to strengthen your faith? How has trusting God's timing brought peace?";
      },
      {
        dayNumber = 4;
        title = "Renew Your Mind";
        scripture = "Romans 12:2";
        action = "Identify a negative thought or belief you've been holding onto. Replace it with a positive, faith-filled affirmation.";
        guidance = "Our thoughts shape our reality. Take time daily to fill your mind with God's truth and let it transform your perspective.";
        reflection = "What thoughts or beliefs needed to be renewed today? How can you continue to focus on positive, faith-based thinking?";
      },
      {
        dayNumber = 5;
        title = "The Power of Prayer";
        scripture = "Philippians 4:6-7";
        action = "Spend dedicated time in prayer, bringing your worries, thanks, and hopes to God. Be honest and open with your heart.";
        guidance = "Prayer is a two-way conversation with God. Take time to listen for His response and guidance.";
        reflection = "What did you pray about today? How did spending time in prayer impact your sense of peace and faith?";
      },
      {
        dayNumber = 6;
        title = "Walking by Faith";
        scripture = "2 Corinthians 5:7";
        action = "Take a step in faith towards something you've been hesitant about. Trust that God is guiding you, even if the path isn't clear.";
        guidance = "Faith is strengthened when we act on it. Don't let fear hold you back from pursuing God's plans for your life.";
        reflection = "In what areas did you choose faith over sight today? How can you continue to walk by faith daily?";
      },
      {
        dayNumber = 7;
        title = "God's Plan for You";
        scripture = "Jeremiah 29:11";
        action = "Reflect on your life goals and dreams. Surrender them to God, trusting that He has a unique purpose for you.";
        guidance = "God's plans may not always align with ours, but they are filled with hope and a future. Be open to His guidance.";
        reflection = "How has God redirected your plans in the past for your good? What are you trusting Him for now?";
      },
      {
        dayNumber = 8;
        title = "Peace in the Storm";
        scripture = "Mark 4:39-40";
        action = "When facing challenges, pause and pray for God's peace. Remember that He can calm any storm you're experiencing.";
        guidance = "Challenges are a part of life, but God's peace is always available. Trust Him to guide you through difficult times.";
        reflection = "How did you experience God's peace today, even in the midst of challenges? What can you do to maintain it?";
      },
      {
        dayNumber = 9;
        title = "Living with Purpose";
        scripture = "Colossians 3:23";
        action = "Approach your daily tasks with intention and purpose. Remember that everything you do matters to God.";
        guidance = "Find meaning in the everyday. Serve others and honor God through your work, relationships, and interactions.";
        reflection = "In what ways did you find purpose in your daily routines? How can you continue to live intentionally?";
      },
      {
        dayNumber = 10;
        title = "Overcoming Doubt";
        scripture = "James 1:6";
        action = "Identify an area where you've been struggling with doubt. Confess it to God and ask for greater faith and assurance.";
        guidance = "Doubt is normal, but it's important to deal with it honestly. Let God turn your doubts into opportunities for growth.";
        reflection = "What doubts did you face today, and how did God help you overcome them? How can you continue to trust Him?";
      },
      {
        dayNumber = 11;
        title = "God's Unconditional Love";
        scripture = "Romans 8:38-39";
        action = "Remind yourself of God's unchanging love. Embrace the truth that you are fully known and fully loved, no matter what.";
        guidance = "Don't let shame or guilt hold you back. God's love is greater than any mistake or shortcoming.";
        reflection = "What areas of your life need to be covered by God's love today? How can you extend that love to others?";
      },
      {
        dayNumber = 12;
        title = "The Power of Forgiveness";
        scripture = "Matthew 6:14-15";
        action = "Think of someone you need to forgive or seek forgiveness from. Take steps towards reconciliation, even if it's difficult.";
        guidance = "Forgiveness frees us from bitterness and resentment. Let go of past hurts and choose to move forward in grace.";
        reflection = "Who do you need to forgive today? How has forgiveness brought healing to your life in the past?";
      },
      {
        dayNumber = 13;
        title = "Strength in Weakness";
        scripture = "2 Corinthians 12:9-10";
        action = "Don't be afraid to admit your struggles. Ask God for strength and rely on His power to carry you through difficult times.";
        guidance = "Your weakness is an opportunity for God to shine. Embrace it and trust Him to work through you.";
        reflection = "In what areas do you need God's strength the most? How has He provided for you in times of weakness?";
      },
      {
        dayNumber = 14;
        title = "Living Generously";
        scripture = "2 Corinthians 9:6-7";
        action = "Look for opportunities to give of your time, resources, and kindness to others. Be generous in all aspects of life.";
        guidance = "Generosity isn't just about money – it's about serving others with a joyful heart.";
        reflection = "How did you practice generosity today? What impact did it have on you and others?";
      },
      {
        dayNumber = 15;
        title = "The Power of Gratitude";
        scripture = "1 Thessalonians 5:18";
        action = "Focus on what you're thankful for. Keep a gratitude journal and write down at least three things you're grateful for each day.";
        guidance = "Gratitude shifts your perspective. Practice it daily and watch as God multiplies your blessings.";
        reflection = "What blessings did you notice today that you may have overlooked? How can you cultivate a heart of gratitude?";
      },
      {
        dayNumber = 16;
        title = "God's Faithfulness";
        scripture = "Lamentations 3:22-23";
        action = "Take time to reflect on how God has been faithful to you in the past. Let it build your faith for the present and future.";
        guidance = "God's faithfulness is unchanging. Trust in His promises and lean on them during difficult times.";
        reflection = "How has remembering God's faithfulness helped you today? What promises are you standing on?";
      },
      {
        dayNumber = 17;
        title = "Walking in Obedience";
        scripture = "Joshua 1:9";
        action = "Identify an area where you need to be more obedient to God's word. Take steps to align your actions with His will.";
        guidance = "Obedience is an act of faith. Trust that God's commands are for your good and take steps to follow Him wholeheartedly.";
        reflection = "How can you continue to walk in obedience daily? What areas need improvement?";
      },
      {
        dayNumber = 18;
        title = "Finding Joy in Trials";
        scripture = "James 1:2-4";
        action = "Embrace challenges as opportunities for growth. Look for lessons and blessings even in difficult circumstances.";
        guidance = "Joy is found in trusting God's plan, even when it's not easy. Lean on Him for strength and support.";
        reflection = "How did you find joy in challenges today? What lessons did you learn?";
      },
      {
        dayNumber = 19;
        title = "The Power of Community";
        scripture = "Hebrews 10:24-25";
        action = "Seek out support and encouragement from fellow believers. Be intentional about building community.";
        guidance = "You're not meant to do life alone. Surround yourself with people who uplift and inspire you.";
        reflection = "How can you be a source of support for others? What communities are you a part of?";
      },
      {
        dayNumber = 20;
        title = "God's Provision";
        scripture = "Philippians 4:19";
        action = "Trust God with your finances, resources, and future plans. Thank Him for all He has provided and believe in His continued provision.";
        guidance = "God promises to provide for your needs. Be a good steward of what you have and trust Him for the rest.";
        reflection = "How did you experience God's provision today? What specific needs are you trusting Him for?";
      },
      {
        dayNumber = 21;
        title = "Overcoming Anxiety";
        scripture = "Matthew 6:34";
        action = "Identify sources of anxiety and surrender them to God. Focus on living one day at a time and don't worry about tomorrow.";
        guidance = "Anxiety can't add a single day to your life. Trust God to handle your concerns and provide for your needs.";
        reflection = "How did you manage anxiety today? What strategies helped you find peace?";
      },
      {
        dayNumber = 22;
        title = "The Power of Worship";
        scripture = "Psalm 100:1-5";
        action = "Make worship a daily part of your routine. It can be through music, prayer, or simply expressing gratitude.";
        guidance = "Worship isn't just for Sundays – it's a lifestyle. Find ways to honor God every day.";
        reflection = "What impact did worship have on your day? How can you incorporate more of it into your life?";
      },
      {
        dayNumber = 23;
        title = "Living with Integrity";
        scripture = "Proverbs 3:5-6";
        action = "Make choices that reflect your values, even when no one's watching. Be a person of integrity, honesty, and character.";
        guidance = "Integrity is the foundation of trust. Let your actions be a reflection of your faith.";
        reflection = "How did integrity shape your decisions today? What areas can you improve in?";
      },
      {
        dayNumber = 24;
        title = "God's Peace";
        scripture = "John 14:27";
        action = "Receive God's peace, even in the midst of difficult circumstances. Trust in His promises and let go of worry.";
        guidance = "Peace is a fruit of the Spirit. Cultivate it through prayer, faith, and gratitude.";
        reflection = "How did you experience God's peace today? What steps can you take to maintain it?";
      },
      {
        dayNumber = 25;
        title = "The Power of Faith";
        scripture = "Hebrews 11:1";
        action = "Strengthen your faith by reflecting on God's character and promises. Trust Him even when you can't see the full picture.";
        guidance = "Faith is the foundation of your relationship with God. Build it daily through prayer, worship, and reading His word.";
        reflection = "How can you continue to grow in faith daily? What challenges are opportunities for growth?";
      },
      {
        dayNumber = 26;
        title = "Living with Hope";
        scripture = "Romans 15:13";
        action = "Hold onto hope in every season, knowing that God is faithful to His word. Encourage others to do the same.";
        guidance = "Hope is anchored in God's promises. Focus on what is true and let go of fear and doubt.";
        reflection = "How can you encourage others with hope? What promises are you holding onto?";
      },
      {
        dayNumber = 27;
        title = "God's Guidance";
        scripture = "Psalm 32:8";
        action = "Seek God's guidance through prayer and reflection. Be open to His direction, even if it's different from your plans.";
        guidance = "Trust that God will lead you every step of the way. Be flexible and obedient to His voice.";
        reflection = "How did you seek guidance today? What steps can you take to follow God's direction?";
      },
      {
        dayNumber = 28;
        title = "Overcoming Temptation";
        scripture = "1 Corinthians 10:13";
        action = "Stay close to God and rely on His strength to overcome temptation. Avoid situations that draw you away from Him.";
        guidance = "Temptation is a part of life, but you have the power to choose God's way. Lean on Him for support.";
        reflection = "How did you handle temptation today? What strategies can you use to stay strong in your faith?";
      },
      {
        dayNumber = 29;
        title = "The Power of Faithfulness";
        scripture = "Galatians 6:9";
        action = "Keep doing good even when you don't see immediate results. Trust that your efforts will bear fruit in time.";
        guidance = "Consistency in your faith produces lasting results. Don't give up in the face of challenges.";
        reflection = "How can you continue to cultivate faithfulness? What areas need more consistency in your life?";
      },
      {
        dayNumber = 30;
        title = "Living Victorious";
        scripture = "1 Corinthians 15:57";
        action = "Walk in victory today, knowing that God is fighting your battles. Celebrate your wins, no matter how small.";
        guidance = "Through Christ, you are more than a conqueror. Live with confidence and boldness in your faith.";
        reflection = "How can you maintain a victorious mindset? What victories can you celebrate?";
      },
    ];

    devotionalDays.addAll(devotionalDaysArray.values());
  };

  public shared ({ caller }) func initializeBibleVerses(verses : [(Text, Nat, Nat, Text)]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize Bible verses");
    };

    for ((book, chapter, verse, text) in verses.values()) {
      let bibleVerse : BibleVerse = {
        book;
        chapter;
        verse;
        text;
      };
      bibleVerses.add(bibleVerse);
    };
  };

  public query ({ caller }) func getAllBibleVerses() : async [BibleVerse] {
    bibleVerses.toArray();
  };

  public query ({ caller }) func getBibleVerse(book : Text, chapter : Nat, verse : Nat) : async ?BibleVerse {
    let result = bibleVerses.keys().find(
      func(i) {
        let b = bibleVerses.at(i);
        b.book == book and b.chapter == chapter and b.verse == verse;
      }
    );

    switch (result) {
      case (?index) { ?bibleVerses.at(index) };
      case (null) { null };
    };
  };

  public query ({ caller }) func searchBible(term : Text) : async [BibleVerse] {
    let results = bibleVerses.toArray().filter(
      func(v) {
        v.text.contains(#text term) or v.book.contains(#text term);
      }
    );
    results;
  };

  public shared ({ caller }) func addJournalEntry(day : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add journal entries");
    };

    let userData = getOrCreateUserData(caller);
    let newEntry : JournalEntry = {
      dayNumber = day;
      content;
      linkedScriptures = [];
    };

    userData.journalEntries.add(day, newEntry);
  };

  public shared ({ caller }) func addLinkedScripture(day : Nat, reference : VerseReference) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add linked scriptures");
    };

    let userData = getOrCreateUserData(caller);
    switch (userData.journalEntries.get(day)) {
      case (null) {};
      case (?entry) {
        let updatedEntry = {
          dayNumber = entry.dayNumber;
          content = entry.content;
          linkedScriptures = entry.linkedScriptures.concat([reference]);
        };
        userData.journalEntries.add(day, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func removeLinkedScripture(day : Nat, reference : VerseReference) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove linked scriptures");
    };

    let userData = getOrCreateUserData(caller);
    switch (userData.journalEntries.get(day)) {
      case (null) {};
      case (?entry) {
        let updatedReferences = entry.linkedScriptures.filter(
          func(r) {
            not (
              r.book == reference.book and
              r.chapter == reference.chapter and
              r.verseStart == reference.verseStart and
              r.verseEnd == reference.verseEnd
            );
          }
        );
        let updatedEntry = {
          dayNumber = entry.dayNumber;
          content = entry.content;
          linkedScriptures = updatedReferences;
        };
        userData.journalEntries.add(day, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func addVerseBookmark(verse : BibleVerse, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add verse bookmarks");
    };

    let userData = getOrCreateUserData(caller);
    let newBookmark : Bookmarks = {
      verse;
      note;
    };
    userData.verseBookmarks.add(newBookmark);
  };

  public shared ({ caller }) func removeVerseBookmark(verse : BibleVerse) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove verse bookmarks");
    };

    let userData = getOrCreateUserData(caller);
    let filtered = userData.verseBookmarks.toArray().filter(
      func(b) {
        not (
          b.verse.book == verse.book and
          b.verse.chapter == verse.chapter and
          b.verse.verse == verse.verse
        );
      }
    );
    userData.verseBookmarks.clear();
    userData.verseBookmarks.addAll(filtered.values());
  };

  public query ({ caller }) func getVerseBookmarks() : async [Bookmarks] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get bookmarks");
    };

    let userData = getOrCreateUserData(caller);
    userData.verseBookmarks.toArray();
  };

  public query ({ caller }) func getDevotionalDay(day : Nat) : async DevotionalDay {
    if (day < 1 or day > 30) {
      return {
        dayNumber = 0;
        title = "";
        scripture = "";
        action = "";
        guidance = "";
        reflection = "";
      };
    };
    let index = Int.abs(day - 1);
    devotionalDays.toArray()[index];
  };

  public query ({ caller }) func getAllJournalEntries() : async [JournalEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get journal entries");
    };

    let userData = getOrCreateUserData(caller);
    userData.journalEntries.values().toArray();
  };

  public query ({ caller }) func getMinistryInfo() : async MinistryInfo {
    {
      missionStatement = "Our mission is to spread the love of Christ and help people find faith in a noisy world.";
      website = "https://templeofpraisefl.org";
      email = "templeofpraise701@gmail.com";
      address = "701 W Alfred St, Tavares, FL";
      supportLink = "https://templeofpraisefl.org/support";
    };
  };

  public query ({ caller }) func getCurrentDay() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get the current day");
    };

    let userData = getOrCreateUserData(caller);
    userData.currentDay;
  };

  public shared ({ caller }) func setCurrentDay(day : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set the current day");
    };

    if (day >= 1 and day <= 30) {
      let existing = getOrCreateUserData(caller);
      let updated = {
        currentDay = day;
        journalEntries = existing.journalEntries;
        reminders = existing.reminders;
        fastingSessions = existing.fastingSessions;
        fastHistory = existing.fastHistory;
        verseBookmarks = existing.verseBookmarks;
        currentFastSession = existing.currentFastSession;
      };
      userDataMap.add(caller, updated);
    };
  };

  public shared ({ caller }) func addReminder(time : Nat, enabled : Bool, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reminders");
    };

    let userData = getOrCreateUserData(caller);
    let reminderIndex = userData.reminders.size();
    userData.reminders.add(reminderIndex, {
      time;
      enabled;
      message;
    });
  };

  public query ({ caller }) func getReminders() : async [Reminder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get reminders");
    };

    let userData = getOrCreateUserData(caller);
    userData.reminders.values().toArray();
  };

  public shared ({ caller }) func updateReminderStatus(index : Nat, enabled : Bool) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update reminder status");
    };

    let userData = getOrCreateUserData(caller);
    switch (userData.reminders.get(index)) {
      case (null) { false };
      case (?r) {
        let updated = {
          time = r.time;
          enabled;
          message = r.message;
        };
        userData.reminders.add(index, updated);
        true;
      };
    };
  };

  public query ({ caller }) func getFastingContent() : async FastingContent {
    fastingContent;
  };

  public shared ({ caller }) func startNewFast(goalHours : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start a new fast");
    };

    if (goalHours <= 0) {
      return false;
    };

    let userData = getOrCreateUserData(caller);
    let newSession : FastingSession = {
      goalHours;
      startTime = ?Time.now();
      status = #inProgress { elapsed = 0 };
      reflectionJournal = "";
      timestamp = Time.now();
    };

    userData.fastingSessions.add(newSession);

    let updatedUserData : UserData = {
      currentDay = userData.currentDay;
      journalEntries = userData.journalEntries;
      reminders = userData.reminders;
      fastingSessions = userData.fastingSessions;
      fastHistory = userData.fastHistory;
      verseBookmarks = userData.verseBookmarks;
      currentFastSession = ?newSession;
    };

    userDataMap.add(caller, updatedUserData);
    true;
  };

  public shared ({ caller }) func updateFastingProgress() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update fasting progress");
    };

    let userData = getOrCreateUserData(caller);
    switch (userData.currentFastSession) {
      case (null) { false };
      case (?session) {
        switch (session.startTime) {
          case (null) { false };
          case (?startTime) {
            let now = Time.now();
            let elapsed = (now - startTime) / 3_600_000_000_000;

            let updatedSession : FastingSession = {
              goalHours = session.goalHours;
              startTime = session.startTime;
              status = #inProgress { elapsed };
              reflectionJournal = session.reflectionJournal;
              timestamp = startTime;
            };

            let updatedSessions = userData.fastingSessions.toArray().map(
              func(s) {
                if (s.timestamp == session.timestamp) { updatedSession } else {
                  s;
                };
              }
            );
            userData.fastingSessions.clear();
            userData.fastingSessions.addAll(updatedSessions.values());

            let updatedUserData : UserData = {
              currentDay = userData.currentDay;
              journalEntries = userData.journalEntries;
              reminders = userData.reminders;
              fastingSessions = userData.fastingSessions;
              fastHistory = userData.fastHistory;
              verseBookmarks = userData.verseBookmarks;
              currentFastSession = ?updatedSession;
            };

            userDataMap.add(caller, updatedUserData);
            true;
          };
        };
      };
    };
  };

  public shared ({ caller }) func completeFast(reflectionJournal : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete a fast");
    };

    let userData = getOrCreateUserData(caller);
    switch (userData.currentFastSession) {
      case (null) { false };
      case (?session) {
        let completedSession : FastingSession = {
          goalHours = session.goalHours;
          startTime = session.startTime;
          status = #completed;
          reflectionJournal = reflectionJournal;
          timestamp = session.timestamp;
        };

        userData.fastHistory.add({
          goalHours = completedSession.goalHours;
          startTime = switch (completedSession.startTime) {
            case (?startTime) { startTime };
            case (null) { Time.now() };
          };
          endTime = Time.now();
          reflectionJournal = completedSession.reflectionJournal;
          timestamp = completedSession.timestamp;
        });

        userData.fastingSessions.clear();

        let updatedUserData : UserData = {
          currentDay = userData.currentDay;
          journalEntries = userData.journalEntries;
          reminders = userData.reminders;
          fastingSessions = userData.fastingSessions;
          fastHistory = userData.fastHistory;
          verseBookmarks = userData.verseBookmarks;
          currentFastSession = null;
        };

        userDataMap.add(caller, updatedUserData);
        true;
      };
    };
  };

  public query ({ caller }) func getFastingProgress() : async FastingSession {
    let userData = getOrCreateUserData(caller);
    switch (userData.currentFastSession) {
      case (null) {
        {
          goalHours = 0;
          startTime = null;
          status = #notStarted;
          reflectionJournal = "";
          timestamp = 0;
        };
      };
      case (?session) {
        session;
      };
    };
  };

  public query ({ caller }) func getAllFastingSessions() : async [FastingSession] {
    let userData = getOrCreateUserData(caller);
    userData.fastingSessions.toArray();
  };

  public query ({ caller }) func getFastingHistory() : async [FastHistory] {
    let userData = getOrCreateUserData(caller);
    userData.fastHistory.toArray();
  };

  public shared ({ caller }) func cancelCurrentFast() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel the current fast");
    };

    let userData = getOrCreateUserData(caller);
    let updatedUserData : UserData = {
      currentDay = userData.currentDay;
      journalEntries = userData.journalEntries;
      reminders = userData.reminders;
      fastingSessions = userData.fastingSessions;
      fastHistory = userData.fastHistory;
      verseBookmarks = userData.verseBookmarks;
      currentFastSession = null;
    };
    userDataMap.add(caller, updatedUserData);
    true;
  };

  public query ({ caller }) func listAllUsers() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };

    let userList = userDataMap.keys();
    userList.toArray();
  };

  public query ({ caller }) func getUserDay(user : Principal) : async Nat {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own progress");
    };

    switch (userDataMap.get(user)) {
      case (?userDataRecord) { userDataRecord.currentDay };
      case (null) { 1 };
    };
  };
};
