import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os
from smtplib import SMTPAuthenticationError, SMTPRecipientsRefused

import sys
import json

if sys.argv[6] == "[]" :
    print('There are no receiver emails')
    sys.exit()

mail_content = sys.argv[4]

#The mail addresses and password
sender_address = sys.argv[1]
sender_pass = sys.argv[2]
receiver_address = sys.argv[6].split(',')

try:
    for receiver in receiver_address:
        try:
            temp = sender_address.split('@')
            if temp[1] in ["gmail.com", "yahoo.com", "hotmail.com", "aol.com", "msn.com", "yahoo.co.in", "live.com", "rediffmail.com", "ymail.com", "outlook.com", "googlemail.com", "facebook.com", "yahoo.in", "acm.org"]:
                try:
                    #Setup the MIME
                    message = MIMEMultipart()
                    message['From'] = sender_address
                    message['To'] = receiver
                    message['Subject'] = sys.argv[3]
                    #The subject line

                    
                    #The body and the attachments for the mail
                    message.attach(MIMEText(mail_content, 'plain'))

                    if sys.argv[5] != '' :
                        attach_file_name = sys.argv[5]
                        attach_file = open(attach_file_name, 'rb') # Open the file as binary mode
                        payload = MIMEBase('application', 'octate-stream')
                        payload.set_payload((attach_file).read())
                        encoders.encode_base64(payload) #encode the attachment


                        #add payload header with filename
                        payload.add_header('Content-Disposition', 'attachment', filename=os.path.basename(attach_file_name))
                        message.attach(payload)
                        # print(os.path.basename(attach_file_name))
                    


                    #Create SMTP session for sending the mail
                    if temp[1] == "gmail.com":
                        session = smtplib.SMTP('smtp.gmail.com', 587) #use gmail with port
                    elif temp[1] == "outlook.com" or temp[1] == "hotmail.com" :
                        session = smtplib.SMTP('smtp-mail.outlook.com', 587)
                    elif temp[1] == "yahoo.in" or temp[1] == "yahoo.com" :
                        session = smtplib.SMTP('smtp.mail.yahoo.com', 587)
                    else :
                        print("This Application only supports gmail, yahoo mail, hotmail and outlook mailing\n")
                        sys.exit()

                    session.starttls() #enable security
                    session.login(sender_address, sender_pass) #login with mail_id and password
                    text = message.as_string()
                    session.sendmail(sender_address, receiver, text)
                    session.quit()

                    print('Mail Sent to ' + receiver + '\n')
                except ArithmeticError:
                        print("")

            else:
                raise SMTPRecipientsRefused("Invalid Receiver Email")
        
        except SMTPRecipientsRefused:
            print('Invalid Receiver Email: ' + receiver + '\n')
        

except SMTPAuthenticationError:
    if sys.argv[6] != "[]" :
        print('\nThe server had some difficulties, it may be because of-\n\n1) The Username and/or Password of sender mail you entered is incorrect\n\n2) Maybe you have not allowed less Secure Apps in your email account.\n     Go to Account -> Security and Allow less secure apps.\n\nTry Again.')
except SystemExit:
    print()
except Exception:
    print("Oops! Something doesn't seem right.\n\nTry Again.")