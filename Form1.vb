Public Class Form1
    Inherits System.Windows.Forms.Form
    Private txtBox(9, 9) As TextBox
    Friend WithEvents btnGenerate As System.Windows.Forms.Button
    Friend WithEvents btnPlay As System.Windows.Forms.Button
    Friend WithEvents btnIsValid As System.Windows.Forms.Button
    Friend WithEvents Button1 As System.Windows.Forms.Button
    Dim sdk As New sudoku

#Region " Windows Form Designer generated code "

    Public Sub New()
        MyBase.New()

        'This call is required by the Windows Form Designer.
        InitializeComponent()

        'Add any initialization after the InitializeComponent() call
        sdk.isLoggingEnabaled = True
    End Sub

    'Form overrides dispose to clean up the component list.
    Protected Overloads Overrides Sub Dispose(ByVal disposing As Boolean)
        If disposing Then
            If Not (components Is Nothing) Then
                components.Dispose()
            End If
        End If
        MyBase.Dispose(disposing)
    End Sub

    'Required by the Windows Form Designer
    Private components As System.ComponentModel.IContainer

    'NOTE: The following procedure is required by the Windows Form Designer
    'It can be modified using the Windows Form Designer.  
    'Do not modify it using the code editor.
    Friend WithEvents btnSubmit As System.Windows.Forms.Button
    Friend WithEvents btnSolve As System.Windows.Forms.Button
    Friend WithEvents btnReset As System.Windows.Forms.Button
    <System.Diagnostics.DebuggerStepThrough()> Private Sub InitializeComponent()
        Dim resources As System.ComponentModel.ComponentResourceManager = New System.ComponentModel.ComponentResourceManager(GetType(Form1))
        Me.btnSubmit = New System.Windows.Forms.Button()
        Me.btnSolve = New System.Windows.Forms.Button()
        Me.btnReset = New System.Windows.Forms.Button()
        Me.btnGenerate = New System.Windows.Forms.Button()
        Me.btnPlay = New System.Windows.Forms.Button()
        Me.btnIsValid = New System.Windows.Forms.Button()
        Me.Button1 = New System.Windows.Forms.Button()
        Me.SuspendLayout()
        '
        'btnSubmit
        '
        Me.btnSubmit.Location = New System.Drawing.Point(8, 272)
        Me.btnSubmit.Name = "btnSubmit"
        Me.btnSubmit.Size = New System.Drawing.Size(72, 24)
        Me.btnSubmit.TabIndex = 109
        Me.btnSubmit.Text = "Su&bmit"
        '
        'btnSolve
        '
        Me.btnSolve.Enabled = False
        Me.btnSolve.Location = New System.Drawing.Point(96, 272)
        Me.btnSolve.Name = "btnSolve"
        Me.btnSolve.Size = New System.Drawing.Size(72, 24)
        Me.btnSolve.TabIndex = 110
        Me.btnSolve.Text = "&Solve"
        '
        'btnReset
        '
        Me.btnReset.Location = New System.Drawing.Point(184, 272)
        Me.btnReset.Name = "btnReset"
        Me.btnReset.Size = New System.Drawing.Size(72, 24)
        Me.btnReset.TabIndex = 111
        Me.btnReset.Text = "&Reset"
        '
        'btnGenerate
        '
        Me.btnGenerate.Location = New System.Drawing.Point(96, 243)
        Me.btnGenerate.Name = "btnGenerate"
        Me.btnGenerate.Size = New System.Drawing.Size(75, 23)
        Me.btnGenerate.TabIndex = 112
        Me.btnGenerate.Text = "Generate"
        Me.btnGenerate.UseVisualStyleBackColor = True
        '
        'btnPlay
        '
        Me.btnPlay.Location = New System.Drawing.Point(7, 242)
        Me.btnPlay.Name = "btnPlay"
        Me.btnPlay.Size = New System.Drawing.Size(75, 23)
        Me.btnPlay.TabIndex = 113
        Me.btnPlay.Text = "Play"
        Me.btnPlay.UseVisualStyleBackColor = True
        '
        'btnIsValid
        '
        Me.btnIsValid.Location = New System.Drawing.Point(181, 243)
        Me.btnIsValid.Name = "btnIsValid"
        Me.btnIsValid.Size = New System.Drawing.Size(75, 23)
        Me.btnIsValid.TabIndex = 114
        Me.btnIsValid.Text = "Validate"
        Me.btnIsValid.UseVisualStyleBackColor = True
        '
        'Button1
        '
        Me.Button1.Location = New System.Drawing.Point(7, 242)
        Me.Button1.Name = "Button1"
        Me.Button1.Size = New System.Drawing.Size(75, 23)
        Me.Button1.TabIndex = 113
        Me.Button1.Text = "Play"
        Me.Button1.UseVisualStyleBackColor = True
        '
        'Form1
        '
        Me.AutoScaleBaseSize = New System.Drawing.Size(5, 13)
        Me.ClientSize = New System.Drawing.Size(264, 309)
        Me.Controls.Add(Me.btnIsValid)
        Me.Controls.Add(Me.btnPlay)
        Me.Controls.Add(Me.btnGenerate)
        Me.Controls.Add(Me.btnReset)
        Me.Controls.Add(Me.btnSolve)
        Me.Controls.Add(Me.btnSubmit)
        Me.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle
        Me.Icon = CType(resources.GetObject("$this.Icon"), System.Drawing.Icon)
        Me.MaximizeBox = False
        Me.Name = "Form1"
        Me.Text = "Sudoku Solver by Vijay"
        Me.ResumeLayout(False)

    End Sub

#End Region

    Private Sub Form1_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        Dim i, j As Integer

        Dim left As Integer = 20
        Dim top As Integer = 20
        Dim tabInd As Integer = 1

        For i = 1 To 9
            If (((i - 1) Mod 3 = 0) And ((i - 1) <> 0)) Then
                left = 20
                top = top + 20
            End If

            For j = 1 To 9

                If (((j - 1) Mod 3 = 0) And ((j - 1) <> 0)) Then
                    left = left + 20
                End If


                txtBox(i, j) = New TextBox
                With txtBox(i, j)
                    .TabIndex = tabInd
                    .Text = 0
                    .TabStop = True
                    .TextAlign = HorizontalAlignment.Center
                    .Left = left
                    .Top = top
                    .Width = 20
                    .Height = 20
                    .Visible = True
                    .MaxLength = 1
                    '.Text = tabInd
                End With
                left = left + 20
                tabInd = tabInd + 1
                Me.Controls.Add(txtBox(i, j))

            Next j
            left = 20
            top = top + 20
        Next i

        'sdk.initialize()

    End Sub

    Private Sub btnSubmit_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnSubmit.Click
        Dim i, j As Integer
        Dim atLeatOneNumber As Boolean = False
        'sdk.initialize()
        For i = 1 To 9
            For j = 1 To 9
                Try
                    sdk.cel(i, j).value = Integer.Parse(Me.txtBox(i, j).Text.Trim())

                    If (sdk.cel(i, j).value < 0) Or (sdk.cel(i, j).value > 9) Then
                        MsgBox("Don't Just play around..!! All the values must be >= 0 and <=9 only buddy!!")
                        Exit Sub
                    ElseIf (sdk.cel(i, j).value > 0) Then
                        atLeatOneNumber = True
                    End If
                Catch ex As Exception
                    MsgBox("Type Conversion Error..!! You must have done some thing Wrong.. ;-)!! ")
                    sdk.flush()
                    Exit Sub
                End Try
                If (sdk.cel(i, j).value > 0) Then
                    sdk.cel(i, j).isSeed = True
                    sdk.cel(i, j).isFilled = True
                    sdk.filledCount = sdk.filledCount + 1
                End If
            Next j
        Next i

        'remove this once done
        sdk.cel(1, 1).assignVal(5, True)
        sdk.cel(1, 2).assignVal(7, True)
        sdk.cel(1, 3).assignVal(1, True)
        sdk.cel(1, 6).assignVal(9, True)
        sdk.cel(2, 1).assignVal(3, True)
        sdk.cel(2, 5).assignVal(5, True)
        sdk.cel(2, 7).assignVal(9, True)
        sdk.cel(2, 9).assignVal(7, True)
        sdk.cel(3, 1).assignVal(9, True)
        sdk.cel(3, 4).assignVal(7, True)
        sdk.cel(3, 9).assignVal(6, True)
        sdk.cel(4, 3).assignVal(2, True)
        sdk.cel(4, 6).assignVal(5, True)
        sdk.cel(4, 7).assignVal(6, True)
        sdk.cel(4, 8).assignVal(9, True)
        sdk.cel(4, 9).assignVal(3, True)
        sdk.cel(5, 2).assignVal(5, True)
        sdk.cel(5, 6).assignVal(8, True)
        sdk.cel(5, 7).assignVal(7, True)
        sdk.cel(6, 1).assignVal(1, True)
        sdk.cel(6, 4).assignVal(3, True)
        sdk.cel(6, 5).assignVal(6, True)
        sdk.cel(6, 8).assignVal(8, True)
        sdk.cel(7, 2).assignVal(4, True)
        sdk.cel(7, 4).assignVal(2, True)
        sdk.cel(7, 5).assignVal(1, True)
        sdk.cel(8, 4).assignVal(8, True)
        sdk.cel(8, 6).assignVal(6, True)
        sdk.cel(8, 8).assignVal(7, True)
        sdk.cel(8, 9).assignVal(9, True)
        sdk.cel(9, 2).assignVal(3, True)
        sdk.cel(9, 3).assignVal(6, True)
        sdk.cel(9, 4).assignVal(5, True)
        sdk.cel(9, 8).assignVal(2, True)

        sdk.filledCount = 34

        'sdk.fillRegions()


        If sdk.isLoggingEnabaled Then
            sdk.print()
        End If


        If (Not atLeatOneNumber) Then
            sdk.flush()
            MsgBox("Not atleast one digit filled..!! You are cheating..!!")
            Exit Sub
        End If

        'For i = 1 To 9
        '    For j = 1 To 9
        '        If sdk.cel(i, j).value > 0 Then
        '            If sdk.isTwiceInColumn(sdk.cel(i, j)) Or
        '               sdk.isTwiceInRow(sdk.cel(i, j)) Or
        '                sdk.isTwiceInRegn(sdk.cel(i, j).rgnRowId, sdk.cel(i, j).rgncolId, sdk.cel(i, j)) Then
        '                MsgBox("No repetitions allowed in a column/row/region!!")
        '                btnSolve.Enabled = False
        '                Exit Sub
        '            End If
        '        End If
        '    Next
        'Next
        If sdk.isValidSudoku() = 10 Then
            MsgBox("No repetitions allowed in a column!")
            btnSolve.Enabled = False
            Exit Sub
        ElseIf sdk.isValidSudoku() = 20 Then
            MsgBox("No repetitions allowed in a row!")
            btnSolve.Enabled = False
            Exit Sub
        ElseIf sdk.isValidSudoku() = 30 Then
            MsgBox("No repetitions allowed in a region!")
            btnSolve.Enabled = False
            Exit Sub
        End If
        btnSolve.Enabled = True

    End Sub

    Private Sub btnSolve_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnSolve.Click
        Dim i, j As Integer
        sdk.solve(True)
        'sdk.print()

        For i = 1 To 9
            For j = 1 To 9
                If (txtBox(i, j).Text = 0) Then
                    txtBox(i, j).Text = sdk.cel(i, j).value
                    txtBox(i, j).ForeColor = System.Drawing.Color.Blue
                End If
            Next
        Next

        'To find second solution
        'sdk.stk.Clear()
        'sdk.fillByBackTracking()

        sdk.flush()
        btnSolve.Enabled = False
    End Sub

    Private Sub btnReset_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnReset.Click
        sdk.flush()
        Dim i, j As Integer
        For i = 1 To 9
            For j = 1 To 9
                txtBox(i, j).Text = 0
                txtBox(i, j).ForeColor = System.Drawing.Color.Black
            Next
        Next
        txtBox(1, 1).Select()
        btnGenerate.Enabled = True
    End Sub

    Private Sub btnGenerate_Click(sender As System.Object, e As System.EventArgs) Handles btnGenerate.Click
        Dim i, j As Integer

        btnSolve.Enabled = False
        btnGenerate.Enabled = False
        sdk.generateSudoku()
        For i = 1 To 9
            For j = 1 To 9
                'If (txtBox(i, j).Text = 0) Then
                txtBox(i, j).Text = sdk.cel(i, j).value
                txtBox(i, j).ForeColor = System.Drawing.Color.Blue
                'End If
            Next
        Next

        If (sdk.isLoggingEnabaled) Then
            sdk.printToFile(sdk.printToString)
        End If
        'For i = 1 To 9
        '    For j = 1 To 9
        '        txtBox(i, j).Text = sdk.cel(i, j).value.ToString
        '    Next
        'Next

    End Sub

    Private Sub Button1_Click(sender As System.Object, e As System.EventArgs) Handles btnPlay.Click, Button1.Click
        'Dim sdkPuzzle1, sdkPuzzle2, sdkPuzzle As sudoku
        'Dim i, j, p, q As Integer
        'Dim flag As Boolean = True
        ''sdkPuzzle1 = sdk.copy
        ''sdkPuzzle2 = sdk.copy
        'sdkPuzzle = sdk.copy
        ''MessageBox.Show(sdkPuzzle1.filledCount.ToString())
        'For j = 1 To 4
        '    For i = 1 To 4
        '        sdkPuzzle.cel(i, i).assignVal(0)
        '        sdkPuzzle.cel(i + j - 1, 9 - i + 1).assignVal(0)
        '        sdkPuzzle.cel(9 - i + 1, i).assignVal(0)
        '        sdkPuzzle.cel(9 - i + 1, 9 - i + 1).assignVal(0)
        '        sdkPuzzle.filledCount = sdkPuzzle.filledCount - 4

        '        sdkPuzzle1 = sdkPuzzle.copy
        '        sdkPuzzle2 = sdkPuzzle.copy

        '        sdkPuzzle1.solve(True)
        '        sdkPuzzle2.solve(False)

        '        If (Not sdkPuzzle1.compareSolution(sdkPuzzle2)) Then
        '            flag = False
        '            MessageBox.Show("Filed at i =" + i.ToString)
        '            'Return
        '        End If

        '        If (flag) Then
        '            'Coninue forther

        '        End If
        '    Next
        'Next

        Dim puzzle As sudoku
        'puzzle = sdk.findCandidates()
        sdk.solve(True)
        puzzle = sdk.makeSudoku()

        Dim p, q As Integer
        For p = 1 To 9
            For q = 1 To 9
                'If (txtBox(i, j).Text = 0) Then
                txtBox(p, q).Text = puzzle.cel(p, q).value
                If (txtBox(p, q).Text = 0) Then
                    txtBox(p, q).ForeColor = System.Drawing.Color.Red
                End If
            Next
        Next


        'Dim k As Integer
        'For k = 1 To 4
        '    shuffle(digits)
        '    Dim i, j As Integer
        '    i = 1
        '    j = 9
        '    While (i <> j)
        '        txtBox(digits(i), digits(j)).Text = sdk.cel(digits(i), digits(j)).value.ToString
        '        txtBox(digits(j), digits(i)).Text = sdk.cel(digits(j), digits(i)).value.ToString
        '        txtBox(digits(i), digits(j)).ForeColor = Color.Blue
        '        txtBox(digits(j), digits(i)).ForeColor = Color.Blue
        '        i = i + 1  
        '        j = j - 1
        '    End While
        '    txtBox(digits(i), digits(j)).Text = sdk.cel(digits(i), digits(j)).value.ToString
        '    txtBox(digits(i), digits(j)).ForeColor = Color.Blue
        'Next


    End Sub
    Private Sub shuffle(ByRef digits() As Integer)
        Dim RandomClass As New Random()
        Dim RandomNumber As Integer
        Dim i, j As Integer
        Dim flag As Boolean = True

        i = 1
        While i <= 9
            flag = True
            RandomNumber = RandomClass.Next(1, 10)
            For j = 1 To i - 1
                If digits(j) = RandomNumber Then
                    flag = False
                    Exit For
                End If
            Next
            If (flag) Then
                digits(i) = RandomNumber
                i = i + 1
                flag = True
            End If
        End While
    End Sub

    Private Sub btnIsValid_Click(sender As System.Object, e As System.EventArgs) Handles btnIsValid.Click

        If (sdk.isValidSudoku = 1) Then
            MsgBox("Valid Sudoku")
        Else
            MsgBox("Not a Valid Sudoku")
        End If
    End Sub
End Class
