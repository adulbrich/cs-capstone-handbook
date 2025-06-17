' This VBA macro sends emails using Microsoft Outlook on macOS.
' It reads email addresses, subjects, and body content from an Excel sheet.
' See the R script to generate the Excel sheet.

Sub SendEmailsMac()
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim appleScript As String

    ' Set worksheet
    Set ws = ThisWorkbook.Sheets("Sheet1")  ' Replace with your sheet name
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row  ' Find last row in column A

    ' Loop through rows
    For i = 2 To 2  ' Start from row 2 to skip headers
        ' Escape special characters in email content
        Dim recipient As String, subject As String, body As String
        recipient = Replace(ws.Cells(i, 1).Value, """", "\""")  ' Column A: Email
        subject = Replace(ws.Cells(i, 2).Value, """", "\""")    ' Column B: Subject
        body = Replace(ws.Cells(i, 3).Value, """", "\""")       ' Column C: Body
        body = Replace(body, vbLf, "<br>")                           ' Replace line breaks
        
        ' AppleScript to send email via Outlook
        appleScript = "tell application ""Microsoft Outlook"" " & vbCrLf & _
                      "set newMessage to make new outgoing message with properties {subject:""" & subject & """, content:""" & body & """} " & vbCrLf & _
                      "make new recipient at newMessage with properties {email address:{address:""" & recipient & """}} " & vbCrLf & _
                      "send newMessage " & vbCrLf & _
                      "end tell"

        ' Execute AppleScript
        On Error Resume Next
        MacScript appleScript
        If Err.Number <> 0 Then
            MsgBox "Failed to send email to " & recipient & ": " & Err.Description, vbExclamation
            Err.Clear
        Else
            Debug.Print "Email sent to " & recipient
        End If
        On Error GoTo 0
    Next i

    MsgBox "Email sending process completed!", vbInformation
End Sub



