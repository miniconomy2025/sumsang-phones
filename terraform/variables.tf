variable "budget_notification_emails" {
  description = "List of email addresses to receive AWS Budget notifications"
  type        = list(string)
  default     = [
    "shashin.gounden@bbd.co.za",
    "gregory.conroy@bbd.co.za",
    "kgothatso.moshoeshoe@bbd.co.za",
    "ron.joseph@bbd.co.za",
    "vusumuzi@bbd.co.za",
    "rudolphe@bbdsoftware.com"
  ]
}

variable "region_name" {
    description = "AWS Region"
    type        = string
    default     = "af-south-1"
}