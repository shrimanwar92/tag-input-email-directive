# tag-input-email-directive

#USAGE

<tag-input
  placeholder="Add an email"
  name = "emails"
  #emails = "ngModel"
  [(ngModel)]="subscription.emails"
  [allowedTagsPattern]="validEmailPattern"
  delimiterCode="188"
  required>
</tag-input>
