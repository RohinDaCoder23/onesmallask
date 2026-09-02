/**
 * One Small Ask — form setup. Everything lives in this one file.
 *
 * >>> IF YOU HAVE ALREADY RUN  setUp  ONCE, NEVER RUN IT AGAIN. <<<
 * >>> It would build a SECOND set of four forms.                <<<
 *
 * To switch the video over to an in-form upload, run  enableVideoUpload  instead.
 *
 * HOW TO RUN THIS (about 60 seconds):
 *   1. Go to  https://script.google.com/  and click  New project
 *   2. Delete whatever is in the editor, paste this whole file in
 *   3. Rename the project "One Small Ask forms" (top left) — optional
 *   4. Make sure  setUp  is selected in the function dropdown, then press Run
 *   5. Google will ask you to authorise it. It is your own script making your
 *      own forms in your own Drive. Click through Advanced → Go to project.
 *   6. Open  View → Logs  (or the Execution log). Your four URLs are printed
 *      there, already formatted to paste straight into src/config.ts
 *
 * Running setUp twice makes a second set of forms. Run it once.
 *
 * WHAT YOU STILL DO BY HAND (3 clicks, spelled out at the bottom of the log):
 *   Apps Script cannot create File upload questions — it is the one item type
 *   the API does not expose. So you add the video upload box in the editor
 *   afterwards. Everything around it is built here.
 */

var YOUR_EMAIL = 'rohinkethipally44@gmail.com';
var SITE_URL   = 'https://rohindacoder23.github.io/onesmallask/';

/* ============================================================ FORM 1 — ASK */

function buildAskForm_() {
  var form = FormApp.create('One Small Ask — ask for help');

  form.setDescription(
    'One specific thing you need, between $5 and $100. Someone who wants to help sends it straight to you — ' +
    'this site never touches the money.\n\n' +
    'THREE THINGS TO KNOW BEFORE YOU START\n\n' +
    '1. You have to be 18 or older. No exceptions.\n\n' +
    '2. You have to record a ten-second video of yourself saying what the money is for. ' +
    'Filmed on your phone, one take, no editing. You will upload it in this form. ' +
    'There is no way around this one — it is the check that makes the whole site work, ' +
    'and it is what lets a stranger trust that you are real.\n\n' +
    '3. Because of the video upload, Google will ask you to sign in with a Google account. ' +
    'Any free Gmail account works. We are not shown your Google account and we do not record it. ' +
    'If you do not have one and cannot make one, email ' + YOUR_EMAIL + ' and we will find another way.\n\n' +
    'WHAT PROTECTS YOU\n\n' +
    '• Nothing is published until a person has read it. Submitting is not posting.\n' +
    '• First names only. Never your full legal name, never your address, never where you are staying.\n' +
    '• Nobody ever has to pay a fee to receive a gift. If someone asks, it is a scam.\n' +
    '• If a donor says they overpaid and wants some back, do not send it. That is a scam aimed at you.\n' +
    '• Never share a bank login, card number, security code, or Social Security number.\n' +
    '• Your request comes down the same day you ask, no questions.\n\n' +
    'If you need shelter, food or help TODAY, call 2-1-1. This site is slow and cannot act now.'
  );

  // --- page 1: the one question that can end the form ---
  var age = form.addMultipleChoiceItem()
    .setTitle('Are you 18 or older?')
    .setHelpText('We ask everyone, and we cannot make an exception to this one.')
    .setRequired(true);

  // --- page 2: the request itself ---
  var main = form.addPageBreakItem()
    .setTitle('Your request')
    .setHelpText('In your own words. Short is fine — specific matters much more than long.');

  form.addTextItem()
    .setTitle('First name, or the name you want shown')
    .setHelpText('Not your full legal name. A first name or a nickname is what appears on the site.')
    .setRequired(true);

  form.addTextItem()
    .setTitle('Your city or area')
    .setHelpText('Just the city or neighbourhood — for example "Aurora" or "east Colorado Springs". Never your address, and please do not name the place you are staying.')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('What kind of thing is this?')
    .setChoiceValues([
      'Food — groceries, a meal, formula',
      'Getting there — bus pass, gas, a fare to work',
      'Health — a prescription, a co-pay, glasses',
      'Staying housed — a utility bill, a late fee, a deposit gap',
      'Work — boots, tools, a uniform, a certification fee',
      'School — supplies, a fee, a textbook',
      'Family — diapers, a school lunch balance, a child’s shoes',
      'Something else'
    ])
    .setRequired(true);

  form.addTextItem()
    .setTitle('In one line, what do you need?')
    .setHelpText('This becomes the headline. For example: "Steel-toe boots so I can start Monday".')
    .setRequired(true);

  var amount = form.addTextItem()
    .setTitle('Exactly how much? (between $5 and $100)')
    .setHelpText('Just the number. An exact amount gets answered far more often than a rounded one.')
    .setRequired(true);
  amount.setValidation(
    FormApp.createTextValidation()
      .setHelpText('Enter a number between 5 and 100. This site is only for small, specific asks.')
      .requireNumberBetween(5, 100)
      .build()
  );

  form.addParagraphTextItem()
    .setTitle('What is going on, and why this amount?')
    .setHelpText('A few sentences in your own words. What makes a stranger want to help is a clear gap with an end to it — "once I am working I am fine" is the kind of sentence that does it.')
    .setRequired(true);

  form.addTextItem()
    .setTitle('What exactly will the money buy?')
    .setHelpText('For example: "One pair of steel-toe work boots, size 11."')
    .setRequired(true);

  form.addTextItem()
    .setTitle('Name one thing we can check')
    .setHelpText('An employer, a clinic, a school, a landlord, a fee — something real that we can confirm exists. This is what separates a real ask from a made-up one, and it protects everyone who posts honestly.')
    .setRequired(true);

  form.addSectionHeaderItem()
    .setTitle('The video')
    .setHelpText(
      'Record ten seconds of yourself saying who you are and what the money is for. ' +
      'Filmed on your phone, one take, no editing — it does not need to be neat, it needs to be you.\n\n' +
      'Upload it below. Nothing gets published without it.'
    );

  form.addMultipleChoiceItem()
    .setTitle('May we publish your video on the site?')
    .setHelpText('You do not have to say yes. The video is used for review either way, and saying no does not affect whether your request is published.')
    .setChoiceValues(['No — use it for review only', 'Yes, it can be shown publicly'])
    .setRequired(true);

  form.addSectionHeaderItem()
    .setTitle('How someone pays you')
    .setHelpText('Shown to a donor only after they have read a safety screen and said they intend to help.');

  form.addMultipleChoiceItem()
    .setTitle('How should someone send it to you?')
    .setHelpText('No Zelle. Zelle shows a stranger your legal bank-account name, which is far more than you should have to give up.')
    .setChoiceValues(['Cash App', 'PayPal', 'Venmo'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('Your handle')
    .setHelpText('Cash App: your $cashtag, e.g. $samsboots.  Venmo: your @username.  PayPal: your paypal.me link.')
    .setRequired(true);

  form.addTextItem()
    .setTitle('An email or phone we can reach you at')
    .setHelpText('Never published, never shown to donors. Used only to tell you whether your request was posted, and to send you the link.')
    .setRequired(true);

  var confirm = form.addCheckboxItem()
    .setTitle('Tick all four to confirm you understand')
    .setChoiceValues([
      'One Small Ask never handles the money — it goes straight from that person to me',
      'I will never send money back to anyone who says they overpaid',
      'I will never share a bank login, card number, security code or my Social Security number',
      'Everything here is true, and I am posting this for myself'
    ])
    .setRequired(true);
  confirm.setValidation(
    FormApp.createCheckboxValidation()
      .setHelpText('All four, please. Each one is there because it protects you.')
      .requireSelectExactly(4)
      .build()
  );

  main.setGoToPage(FormApp.PageNavigationType.SUBMIT);

  // --- page 3: the under-18 exit ---
  var decline = form.addPageBreakItem()
    .setTitle('We cannot post this one')
    .setHelpText(
      'One Small Ask cannot publish a request from anyone under 18. That is not about you — it is a line we do not move, ' +
      'because a public post asking strangers for money is not a safe thing for a minor to have.\n\n' +
      'Please call 2-1-1, or visit 211colorado.org. They can help today, in ways this site cannot. ' +
      'If you are not safe where you are, that is exactly what they are for.\n\n' +
      'Press submit and nothing further will happen.'
    );

  age.setChoices([
    age.createChoice('Yes, I am 18 or older', main),
    age.createChoice('No, I am under 18', decline)
  ]);

  form.setConfirmationMessage(
    'Got it — and thank you for trusting us with it.\n\n' +
    'What happens now: a person reads every word of this and watches your video. Usually a day or two. ' +
    'If it is published you will get the link. If it is not, you will hear that too, with the reason — we do not leave people wondering.\n\n' +
    'If you need help today, call 2-1-1.'
  );

  return form;
}

/* ================================================= FORMS 2, 3, 4 — SHORTER */

function buildDonorForm_() {
  var form = FormApp.create('One Small Ask — I sent it');
  form.setDescription(
    'Thank you. This is the half of the record that only you can give us.\n\n' +
    'A gift is only ever counted on the Impact page when BOTH people confirm it — you saying you sent it, ' +
    'and them saying they received it. One side alone is never enough, and nothing is ever estimated.'
  );

  form.addTextItem().setTitle('Which request did you help with?')
    .setHelpText('The headline, or paste the link.').setRequired(true);
  form.addTextItem().setTitle('How much did you send?').setRequired(true);
  form.addDateItem().setTitle('What date did you send it?').setRequired(true);
  form.addMultipleChoiceItem().setTitle('Which app?')
    .setChoiceValues(['Cash App', 'PayPal', 'Venmo', 'Something else']);
  form.addTextItem().setTitle('Your email')
    .setHelpText('Used only to match your confirmation with theirs. Never published, never shared with them.')
    .setRequired(true);

  form.addSectionHeaderItem().setTitle('Two optional questions')
    .setHelpText('Only if you feel like it — they help us understand who actually uses this.');
  form.addMultipleChoiceItem().setTitle('How did you find One Small Ask?')
    .setChoiceValues(['Someone sent me the link', 'An organization mentioned it', 'Social media', 'I know Rohin', 'Somewhere else']);
  form.addParagraphTextItem().setTitle('Anything you want us to know?');

  form.setConfirmationMessage(
    'Recorded — thank you.\n\nIt appears on the Impact page once they confirm it too. ' +
    'If something goes wrong, tell us at ' + YOUR_EMAIL + ' and we will act the same day.'
  );
  return form;
}

function buildRequesterForm_() {
  var form = FormApp.create('One Small Ask — I received it');
  form.setDescription('Good news, and thank you for closing the loop. Only gifts both people confirm are ever counted.');

  form.addTextItem().setTitle('Which request is yours?')
    .setHelpText('The headline, or paste the link.').setRequired(true);
  form.addTextItem().setTitle('How much did you receive?').setRequired(true);
  form.addDateItem().setTitle('What date?').setRequired(true);
  form.addTextItem().setTitle('Your email or phone')
    .setHelpText('The same one you gave when you posted, so we can match it up.').setRequired(true);
  form.addMultipleChoiceItem().setTitle('Is your request met now?')
    .setChoiceValues(['Yes — please take it down', 'Not yet — part of it is still open'])
    .setRequired(true);
  form.addParagraphTextItem().setTitle('Anything you want to say? (optional)')
    .setHelpText('Only shared publicly if you tell us you want it to be.');

  form.setConfirmationMessage(
    'Thank you — recorded.\n\nIf anything about this went wrong, or anyone asked you to send money back, ' +
    'tell us at ' + YOUR_EMAIL + ' straight away. That is always a scam and it is never your fault.'
  );
  return form;
}

function buildReportForm_() {
  var form = FormApp.create('One Small Ask — report a problem');
  form.setDescription(
    'Read the day it arrives. If there is real doubt about a listed request it comes down first and gets looked at afterwards.\n\n' +
    'You do not need to prove anything or leave your name.'
  );

  form.addMultipleChoiceItem().setTitle('What are you reporting?')
    .setChoiceValues([
      'A request that looks wrong',
      'Someone’s behaviour toward me',
      'I want my own request removed',
      'Something else'
    ]).setRequired(true);
  form.addTextItem().setTitle('Which request?').setHelpText('If you know it.');
  form.addParagraphTextItem().setTitle('What happened?').setRequired(true);
  form.addTextItem().setTitle('How can we reach you? (optional)')
    .setHelpText('Only if you want a reply. Anonymous reports are read exactly the same way.');

  form.setConfirmationMessage('Thank you. This is read today, not this week.');
  return form;
}

/* ============================================ EMAIL-ON-SUBMIT FOR FORM 1 */

/**
 * Fires on every new request. Emails you a review packet with the answers laid
 * out in review order, plus a ready-to-use new-request.json — so publishing is
 * paste, check the boxes, run the script.
 */
function onAskSubmit(e) {
  var answers = {};
  var items = e.response.getItemResponses();
  for (var i = 0; i < items.length; i++) {
    answers[items[i].getItem().getTitle()] = items[i].getResponse();
  }

  var get = function (needle) {
    for (var k in answers) {
      if (k.toLowerCase().indexOf(needle.toLowerCase()) !== -1) {
        return String(answers[k] || '');
      }
    }
    return '';
  };

  var name    = get('First name');
  var area    = get('city or area');
  var title   = get('In one line');
  var amount  = parseFloat(String(get('Exactly how much')).replace(/[^0-9.]/g, '')) || 0;
  var story   = get('What is going on');
  var forWhat = get('What exactly will the money buy');
  var check   = get('one thing we can check');
  var method  = get('How should someone send');
  var handle  = get('Your handle');
  var reach   = get('reach you at');
  // The uploaded video. Keyed on item TYPE, not title, so renaming the
  // question in the editor cannot silently break this.
  var video = 'NO VIDEO ATTACHED — do not publish until you have one';
  try {
    for (var v = 0; v < items.length; v++) {
      if (items[v].getItem().getType() === FormApp.ItemType.FILE_UPLOAD) {
        var ids = items[v].getResponse();
        if (ids && ids.length) {
          video = 'https://drive.google.com/file/d/' + ids[0] + '/view';
        }
      }
    }
  } catch (err) {
    video = 'could not read the upload (' + err + ') — check the response in the form';
  }
  var pub     = get('May we publish');

  var methodKey = method.indexOf('Cash') === 0 ? 'cashapp'
                : method.indexOf('PayPal') === 0 ? 'paypal'
                : method.indexOf('Venmo') === 0 ? 'venmo' : 'cashapp';

  var slug = (name + '-' + title).toLowerCase().replace(/[^a-z0-9]+/g, '-')
               .replace(/^-|-$/g, '').split('-').slice(0, 3).join('-');
  var d = new Date();
  var mmdd = ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);

  var json = {
    id: slug + '-' + mmdd,
    name: name,
    area: area,
    category: 'work',
    amountUsd: amount,
    title: title,
    story: story,
    forWhat: forWhat,
    contactMethod: methodKey,
    contactHandle: handle,
    videoUrl: '',
    reviewNote: '',
    confirmedAdult: false,
    videoWatched: false,
    photoReverseSearched: false,
    detailCorroborated: false,
    duplicateScreened: false
  };

  var body =
    'NEW REQUEST — not published, nothing is live until you publish it.\n' +
    '===========================================================\n\n' +
    'BEFORE YOU PUBLISH, ALL FOUR:\n' +
    '  1. Watch the whole video. Real person, matches the story, not a minor, nobody coaching off-camera.\n' +
    '  2. Reverse-image search any photo (and a video frame if anything feels off).\n' +
    '  3. Corroborate this detail:  ' + check + '\n' +
    '  4. Screen against everything submitted before — handle, name, area, story.\n\n' +
    'WATCH THE VIDEO:  ' + video + '\n' +
    'Publish the video? ' + pub + '\n' +
    'Reach them at: ' + reach + '   (never publish this)\n\n' +
    '-----------------------------------------------------------\n' +
    'WHAT THEY WROTE\n\n' +
    'Name shown:  ' + name + '\n' +
    'Area:        ' + area + '\n' +
    'Amount:      $' + amount + '\n' +
    'Headline:    ' + title + '\n' +
    'For:         ' + forWhat + '\n\n' +
    'Story:\n' + story + '\n\n' +
    'Pays via:    ' + method + '  ->  ' + handle + '\n\n' +
    '-----------------------------------------------------------\n' +
    'TO PUBLISH: save the block below as new-request.json in your repo,\n' +
    'set the five check flags to true once you have actually done them,\n' +
    'fix the category if it is wrong, then:\n\n' +
    '    node scripts/publish.mjs new-request.json\n' +
    '    npm run build && git commit -am "Publish request: ' + json.id + '" && git push\n\n' +
    'category must be one of: food transport medical housing work school family other\n\n' +
    JSON.stringify(json, null, 2) + '\n\n' +
    '-----------------------------------------------------------\n' +
    'If anything about this makes you hesitate, do not publish it. A request you\n' +
    'were unsure about is the one that costs you the whole project.\n';

  MailApp.sendEmail({
    to: YOUR_EMAIL,
    subject: 'One Small Ask — new request from ' + (name || 'someone') + ' ($' + amount + ')',
    body: body
  });
}

/* ================================================================== SETUP */

function setUp() {
  var ask       = buildAskForm_();
  var donor     = buildDonorForm_();
  var requester = buildRequesterForm_();
  var report    = buildReportForm_();

  // Every new request emails you a review packet with the JSON already built.
  ScriptApp.newTrigger('onAskSubmit').forForm(ask).onFormSubmit().create();

  var shorten = function (form) {
    try { return form.shortenFormUrl(form.getPublishedUrl()); }
    catch (err) { return form.getPublishedUrl(); }
  };

  var out = [
    '',
    '=========================================================',
    '  PASTE THIS INTO  src/config.ts',
    '=========================================================',
    '',
    'export const FORMS = {',
    '  submitRequest:    "' + shorten(ask) + '",',
    '  donorConfirm:     "' + shorten(donor) + '",',
    '  requesterConfirm: "' + shorten(requester) + '",',
    '  reportConcern:    "' + shorten(report) + '",',
    '} as const;',
    '',
    '=========================================================',
    '  EDIT LINKS (bookmark these)',
    '=========================================================',
    '',
    'Ask for help:   ' + ask.getEditUrl(),
    'I sent it:      ' + donor.getEditUrl(),
    'I received it:  ' + requester.getEditUrl(),
    'Report:         ' + report.getEditUrl(),
    '',
    '=========================================================',
    '  TWO THINGS TO DO BY HAND',
    '=========================================================',
    '',
    '1. ADD THE VIDEO UPLOAD BOX to the ask form. Apps Script cannot',
    '   create it. Open the ask form editor, scroll to "The video"',
    '   section, click + underneath it, then:',
    '        Title  ->  Your ten-second video',
    '        Type   ->  File upload  (Continue past the sign-in warning)',
    '        Allow only specific file types -> ON -> tick Video',
    '        Maximum number of files -> 1',
    '        Maximum file size -> 100 MB',
    '        Required -> ON',
    '',
    '2. On the OTHER THREE forms: Responses tab -> three dots ->',
    '   "Get email notifications for new responses". The ask form',
    '   already emails you a full review packet; those three do not.',
    '',
    ''
  ].join('\n');

  Logger.log(out);
  MailApp.sendEmail({
    to: YOUR_EMAIL,
    subject: 'One Small Ask — your four form URLs',
    body: out
  });
}

/* ====================================== SWITCH THE VIDEO TO AN UPLOAD */

// Filled in by setUp; if you are running this later, paste your ask-form id here.
var ASK_FORM_ID_ = '1u53GzYvqkCuftoW8jFXtYhKERItZuUa60s330PrWeEc';

function enableVideoUpload() {
  var form = FormApp.openById(ASK_FORM_ID_);

  form.setDescription(
    'One specific thing you need, between $5 and $100. Someone who wants to help sends it straight to you — ' +
    'this site never touches the money.\n\n' +
    'THREE THINGS TO KNOW BEFORE YOU START\n\n' +
    '1. You have to be 18 or older. No exceptions.\n\n' +
    '2. You have to record a ten-second video of yourself saying what the money is for. ' +
    'Filmed on your phone, one take, no editing. You will upload it in this form. ' +
    'There is no way around this one — it is the check that makes the whole site work, ' +
    'and it is what lets a stranger trust that you are real.\n\n' +
    '3. Because of the video upload, Google will ask you to sign in with a Google account. ' +
    'Any free Gmail account works. We are not shown your Google account and we do not record it. ' +
    'If you do not have one and cannot make one, email ' + YOUR_EMAIL + ' and we will find another way.\n\n' +
    'WHAT PROTECTS YOU\n\n' +
    '• Nothing is published until a person has read it. Submitting is not posting.\n' +
    '• First names only. Never your full legal name, never your address, never where you are staying.\n' +
    '• Your video is used for review. It is only shown publicly if you tick the box saying you want it to be.\n' +
    '• Nobody ever has to pay a fee to receive a gift. If someone asks, it is a scam.\n' +
    '• If a donor says they overpaid and wants some back, do not send it. That is a scam aimed at you.\n' +
    '• Never share a bank login, card number, security code, or Social Security number.\n' +
    '• Your request comes down the same day you ask, no questions.\n\n' +
    'If you need shelter, food or help TODAY, call 2-1-1. This site is slow and cannot act now.'
  );

  var items = form.getItems();
  var deleted = 0;

  for (var i = items.length - 1; i >= 0; i--) {
    var t = items[i].getTitle();

    // The email-a-video question is obsolete once the upload box exists.
    if (t.indexOf('Have you sent the video') !== -1) {
      form.deleteItem(items[i]);
      deleted++;
      continue;
    }

    if (t === 'The video') {
      items[i].asSectionHeaderItem().setHelpText(
        'Record ten seconds of yourself saying who you are and what the money is for. ' +
        'Filmed on your phone, one take, no editing — it does not need to be neat, it needs to be you.\n\n' +
        'Upload it below. Nothing gets published without it.'
      );
    }

    if (t.indexOf('Are you 18 or older') !== -1) {
      items[i].asMultipleChoiceItem().setHelpText(
        'We ask everyone, and we cannot make an exception. A public post asking strangers for money ' +
        'is not a safe thing for someone under 18 to have.'
      );
    }

    if (t.indexOf('May we publish your video') !== -1) {
      items[i].asMultipleChoiceItem().setHelpText(
        'You do not have to say yes, and saying no does not affect whether your request is published. ' +
        'The video is watched during review either way. Most people say no, and that is completely fine.'
      );
    }
  }

  var log = [
    '',
    'Form updated. Deleted ' + deleted + ' obsolete question(s).',
    '',
    '=========================================================',
    '  NOW ADD THE UPLOAD BOX BY HAND — 3 STEPS',
    '=========================================================',
    '',
    'Open: ' + form.getEditUrl(),
    '',
    '1. Scroll to the section headed "The video".',
    '   Click the + button (add question) directly underneath it.',
    '',
    '2. Set the question title to:   Your ten-second video',
    '   Then open the question-type dropdown (it says "Multiple choice")',
    '   and choose  File upload.  Click Continue when it warns you that',
    '   respondents will have to sign in — that is expected.',
    '',
    '3. In that question, set:',
    '        Allow only specific file types  ->  ON  ->  tick  Video',
    '        Maximum number of files         ->  1',
    '        Maximum file size               ->  100 MB',
    '        Required                        ->  ON  (bottom right toggle)',
    '',
    '=========================================================',
    '  THEN CHECK IT',
    '=========================================================',
    '',
    'Open the live form and submit a real test with an actual video:',
    '  ' + form.getPublishedUrl(),
    '',
    'You should get: the review email, AND the video in your Drive',
    'under a folder named after the form. The response row links to it.',
    '',
    'Storage: a 10-second phone video is roughly 5-20 MB, so a free',
    '15 GB Drive holds on the order of a thousand of them. Not a concern',
    'for a long time, but it is your Drive filling up, not Google\'s.',
    ''
  ].join('\n');

  Logger.log(log);
  MailApp.sendEmail({
    to: YOUR_EMAIL,
    subject: 'One Small Ask — finish the video upload (3 steps)',
    body: log
  });
}
