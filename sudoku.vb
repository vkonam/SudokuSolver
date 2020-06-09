Imports System.IO.File
Imports System.IO.FileStream
Imports System.IO.StreamWriter
Public Class sudoku
    'Public regn(3, 3) As region
    Public cel(9, 9) As Cell
    Public regn(3, 3) As region
    Private stk As New Stack
    Public filledCount As Integer
    Public isLoggingEnabaled As Boolean
    Private RandomClass As Random

    Sub New()
        Dim i, j, m, n, p, q As Integer

        For i = 1 To 9
            For j = 1 To 9
                cel(i, j) = New Cell
            Next j
        Next i

        For i = 1 To 3
            For j = 1 To 3
                regn(i, j) = New region
            Next j
        Next i
        filledCount = 0
        isLoggingEnabaled = False

        initialize()
        RandomClass = New Random()
    End Sub
    Public Sub getRow(ByVal cel As Cell)
        Dim j As Integer
        Dim s As String
        For j = 1 To 9
            s = s & Me.cel(cel.RowId, j).value & " "
        Next j
        MsgBox(s)
    End Sub
    Public Sub getColumn(ByVal cel As Cell)
        Dim i As Integer
        Dim s As String
        For i = 1 To 9
            s = s & Me.cel(i, cel.ColId).value & " "
        Next i
        MsgBox(s)
    End Sub
    Public Sub getRegion(ByVal cel As Cell)
        Dim i, j As Integer
        Dim s As String
        For i = 1 To 3
            For j = 1 To 3
                s = s & Me.cel((regn(cel.rgnRowId, cel.rgncolId).cells(i, j).row), (regn(cel.rgnRowId, cel.rgncolId).cells(i, j).col)).value & " "
            Next j
        Next i
        MsgBox(s)
    End Sub
    Public Function isInColumn(ByVal key As Integer, ByVal cel As Cell) As Boolean
        Dim i As Integer
        For i = 1 To 9
            If (key = Me.cel(i, cel.ColId).value) Then
                Return True
            End If
        Next i
        Return False
    End Function
    Public Function isInRow(ByVal key As Integer, ByVal cel As Cell) As Boolean
        Dim j As Integer
        For j = 1 To 9
            If (key = Me.cel(cel.RowId, j).value) Then
                Return True
            End If
        Next j

        Return False
    End Function
    Public Function isInRgn(ByVal key As Integer, ByVal cel As Cell) As Boolean
        Dim i, j As Integer
        For i = 1 To 3
            For j = 1 To 3
                If (key = Me.cel((regn(cel.rgnRowId, cel.rgncolId).cells(i, j).row), (regn(cel.rgnRowId, cel.rgncolId).cells(i, j).col)).value) Then
                    Return True
                End If
            Next j
        Next i
        Return False
    End Function
    Public Sub solve(ByVal order As Boolean)
        Dim oldFilledCount As Integer = 0
        While (filledCount < 81) And (oldFilledCount <> filledCount)
            'MsgBox(filledCount)
            ' assign it before this changes
            oldFilledCount = filledCount
            fillByElimination(order)
        End While

        If (isLoggingEnabaled) Then
            Dim i, j, k As Integer
            Dim str As String
            For i = 1 To 9
                For j = 1 To 9
                    For k = 1 To 9
                        str = str + cel(i, j).probableValues(k).ToString + ","
                    Next
                    printToFile("cel(" + i.ToString + "," + j.ToString + "):" + str)
                    str = ""
                Next
            Next
        End If

        If (filledCount < 81) Then
            fillByBackTracking()
        End If
    End Sub
    Private Sub fillByBackTracking()
        Dim i, j As Integer

        i = 1
        j = 1
        While (i <= 9)
            j = 1
            While (j <= 9)
                If (Not Me.cel(i, j).isFilled) Then
                    Dim pc As Integer
                    Dim c As Cell
                    Dim flag As Boolean = False

                    'As initial val is 0, make it one to start the loop
                    If (cel(i, j).currentProbableValUsed = 0) Then
                        cel(i, j).currentProbableValUsed = 1
                    End If
                    c = cel(i, j)

                    For pc = c.currentProbableValUsed To c.countOfProbables
                        If (Not Me.isInRow(c.probableValues(pc), c)) And _
                           (Not Me.isInColumn(c.probableValues(pc), c)) And _
                           (Not Me.isInRgn(c.probableValues(pc), c)) Then

                            c.assignVal(c.probableValues(pc), pc)
                            Me.stk.Push(c)
                            flag = True
                            c.currentProbableValUsed = pc
                            j = j + 1
                            Exit For
                        End If
                    Next
                    If (flag = False) Then 'we could not place a val
                        'Reset the current probable val to 0 as it is being popped
                        c.value = 0
                        c.currentProbableValUsed = 0
                        Try
                            c = stk.Pop()
                        Catch ex As Exception
                            MsgBox("Stack Problem..!! Sorry for the break.. I have to stop the application!! :-(( ")
                            End
                        End Try
                        ' needed to start from the next probable value
                        c.isFilled = False
                        c.currentProbableValUsed = c.currentProbableValUsed + 1
                        i = c.RowId
                        j = c.ColId

                    End If
                Else
                    j = j + 1
                End If
            End While
            i = i + 1
        End While
        'print()

    End Sub
    Private Sub fillByElimination()
        fillByElimination(True)
        'Dim i, j, keyVal As Integer
        'Me.flushProbables()

        'For i = 1 To 9
        '    For j = 1 To 9
        '        Dim p As Integer = 0
        '        For keyVal = 1 To 9
        '            If (Me.cel(i, j).isFilled = False) Then

        '                If (Me.isInColumn(keyVal, cel(i, j)) = False) And _
        '                (Me.isInRow(keyVal, cel(i, j)) = False) And _
        '                (Me.isInRgn(keyVal, cel(i, j)) = False) Then

        '                    p = p + 1
        '                    Me.cel(i, j).probableValues(p) = keyVal
        '                    Me.cel(i, j).countOfProbables = p
        '                End If

        '            End If
        '        Next keyVal
        '    Next
        'Next

        'For i = 1 To 9
        '    For j = 1 To 9
        '        If (cel(i, j).countOfProbables = 1) And (cel(i, j).isFilled = False) And (cel(i, j).isSeed = False) Then
        '            'cel(i, j).value = cel(i, j).probableValues(1)
        '            'cel(i, j).isFilled = True
        '            cel(i, j).assignVal(cel(i, j).probableValues(1), 1, True)
        '            filledCount = filledCount + 1
        '        End If
        '    Next
        'Next
        'Me.print()
    End Sub
    Private Sub fillByElimination(ByVal order As Boolean)
        Dim i, j, keyVal As Integer
        Me.flushProbables()

        Dim fromNum, toNum, sign As Integer
        If (order) Then
            fromNum = 1
            toNum = 9
            sign = 1
        Else
            fromNum = 9
            toNum = 1
            sign = -1
        End If
        For i = 1 To 9
            For j = 1 To 9
                Dim p As Integer = 0
                keyVal = fromNum
                For keyVal = fromNum To toNum Step sign * 1
                    If (Me.cel(i, j).isFilled = False) Then

                        If (Me.isInColumn(keyVal, cel(i, j)) = False) And _
                        (Me.isInRow(keyVal, cel(i, j)) = False) And _
                        (Me.isInRgn(keyVal, cel(i, j)) = False) Then

                            p = p + 1
                            Me.cel(i, j).probableValues(p) = keyVal
                            Me.cel(i, j).countOfProbables = p
                        End If

                    End If
                Next keyVal
            Next
        Next

        For i = 1 To 9
            For j = 1 To 9
                If (cel(i, j).countOfProbables = 1) And (cel(i, j).isFilled = False) And (cel(i, j).isSeed = False) Then
                    'cel(i, j).value = cel(i, j).probableValues(1)
                    'cel(i, j).isFilled = True
                    cel(i, j).assignVal(cel(i, j).probableValues(1), 1, True)
                    filledCount = filledCount + 1
                End If
            Next
        Next
        'Me.print()
    End Sub
    
    Private Sub fillProbablesForCell(ByVal i As Integer, ByVal j As Integer)
        Dim keyVal, keyIndex As Integer
        Dim p As Integer = 0
        Dim digits(9) As Integer
        Dim c As Cell

        c = cel(i, j)

        'digits = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
        'System.Threading.Thread.Sleep(5)
        digits = getRandomArray()
        'digits = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
        c.countOfProbables = 0

        For keyIndex = 1 To 9
            keyVal = digits(keyIndex)
            If (Me.isInColumn(keyVal, c) = False) And _
            (Me.isInRow(keyVal, c) = False) And _
            (Me.isInRgn(keyVal, c) = False) Then

                p = p + 1
                c.probableValues(p) = keyVal
                c.countOfProbables = p
                'Else
                '    If cel(i, j).value = keyVal Then
                '        p = p + 1
                '        Me.cel(i, j).probableValues(p) = keyVal
                '        Me.cel(i, j).countOfProbables = p
                '        Me.cel(i, j).currentProbableValUsed = p
                '    End If
            End If
        Next keyIndex
    End Sub
    Public Sub fillRegions()
        Dim i, j, k, l, p, q As Integer

        Dim s As String

        'For i = 1 To 3
        '    For j = 1 To 3
        '        For k = 1 To 3
        '            For l = 1 To 3
        '                For p = 1 To 9
        '                    For q = 1 To 9
        '                        If ((Me.cel(p, q).rgnRowId = i) And _
        '                            (Me.cel(p, q).rgncolId = j) And _
        '                            (Me.cel(p, q).inRgnRowId = k) And _
        '                            (Me.cel(p, q).inRgnColId = l)) Then _

        '                            Me.regn(i, j).cells(k, l).row = p
        '                            Me.regn(i, j).cells(k, l).col = q
        '                            Exit For
        '                        End If
        '                    Next q
        '                Next p
        '                s = s & regn(i, j).cells(k, l).row & "," & regn(i, j).cells(k, l).col & " "
        '            Next l
        '        Next k
        '        s = s & vbCrLf
        '    Next j
        'Next i
        'MsgBox(s)
        For i = 1 To 9
            For j = 1 To 9
                regn(cel(i, j).rgnRowId, cel(i, j).rgncolId).cells(cel(i, j).inRgnRowId, cel(i, j).inRgnColId).row = i
                regn(cel(i, j).rgnRowId, cel(i, j).rgncolId).cells(cel(i, j).inRgnRowId, cel(i, j).inRgnColId).col = j

            Next

        Next

        'For i = 1 To 3
        '    For j = 1 To 3
        '        For k = 1 To 3
        '            For l = 1 To 3
        '                s = s & regn(i, j).cells(k, l).row & "," & regn(i, j).cells(k, l).col & " "
        '            Next
        '        Next
        '        s = s & vbCrLf
        '    Next
        'Next
        'MsgBox(s)
    End Sub

    Public Sub print()
        Dim i, j As Integer
        Dim str As String = ""
        For i = 1 To 9
            If (((i - 1) Mod 3 = 0) And ((i - 1) <> 0)) Then
                str = str & vbCrLf
            End If

            str = str & vbCrLf

            For j = 1 To 9
                If (((j - 1) Mod 3 = 0) And ((j - 1) <> 0)) Then
                    str = str & "    "
                End If

                str = str & Me.cel(i, j).value & "   "
            Next
        Next

        MsgBox(str)
    End Sub

    Public Function printToString() As String
        Dim i, j As Integer
        Dim str As String = ""
        For i = 1 To 9
            If (((i - 1) Mod 3 = 0) And ((i - 1) <> 0)) Then
                str = str & vbCrLf
            End If

            str = str & vbCrLf

            For j = 1 To 9
                If (((j - 1) Mod 3 = 0) And ((j - 1) <> 0)) Then
                    str = str & " "
                End If

                str = str & Me.cel(i, j).value & "  "
            Next
        Next
        Return str
    End Function

    Private Sub flushProbables()
        Dim i, j As Integer
        For i = 1 To 9
            For j = 1 To 9
                cel(i, j).countOfProbables = 0
            Next
        Next
    End Sub
    Public Sub flush()
        Me.filledCount = 0
        Me.stk.Clear()
        Dim i, j, k As Integer
        For i = 1 To 9
            For j = 1 To 9
                cel(i, j).value = 0
                'cel(i, j).ColId = 0
                'cel(i, j).RowId = 0
                'cel(i, j).rgnRowId = 0
                'cel(i, j).rgncolId = 0
                'cel(i, j).inRgnRowId = 0
                'cel(i, j).inRgnColId = 0
                cel(i, j).countOfProbables = 0
                cel(i, j).currentProbableValUsed = 0
                cel(i, j).isFilled = False
                cel(i, j).isSeed = False
                'cel(i, j).probableValues(k) = 0
                System.Array.Clear(cel(i, j).probableValues, 1, 9)
            Next
        Next
    End Sub
    'Public Sub generateSudoku() 'As sudoku

    '    'Dim iSudoku(9, 9) As Integer
    '    Dim RandomClass As New Random()
    '    'Dim RandomNumber As Integer
    '    'Dim curCel As Cell
    '    Dim i, j, k, x, value As Integer
    '    Dim digits(9), randRowCol(9) As Integer
    '    Dim flag As Boolean = False
    '    Dim str As String

    '    flush()
    '    initialize()
    '    'InitializeComponent sudoku
    '    'For i = 1 To 9
    '    '    For j = 1 To 9
    '    '        iSudoku(i, j) = 0
    '    '    Next
    '    'Next
    '    'For i = 1 To 9
    '    '    digits(i) = i
    '    'Next
    '    filledCount = 0
    '    'Shuffle the row columns so that, random rows are filled
    '    shuffle(randRowCol)
    '    Dim iIndex, jIndex As Integer
    '    iIndex = 1
    '    jIndex = 1
    '    i = randRowCol(iIndex)
    '    While (iIndex <= 9)
    '        jIndex = 1
    '        i = randRowCol(iIndex)
    '        While (jIndex <= 9)
    '            j = randRowCol(jIndex)
    '            shuffle(digits)
    '            k = 0
    '            Do
    '                k = k + 1
    '                'RandomNumber = RandomClass.Next(1, 10)
    '                'iSudoku(i, j) = RandomNumber
    '                'curCel = New Cell
    '                'curCel.assignVal(RandomNumber, True)
    '                'For k = 1 To 9
    '                If (k > 9) Then
    '                    MsgBox("Fishy")
    '                    MsgBox(str)
    '                    ''make current cell 0
    '                    cel(i, j).assignVal(0)
    '                    'need to back track
    '                    'If (jIndex > 1) Then
    '                    '    jIndex = jIndex - 1
    '                    '    j = randRowCol(jIndex)
    '                    'Else
    '                    '    iIndex = iIndex - 1
    '                    '    jIndex = 9
    '                    '    i = randRowCol(iIndex)
    '                    '    j = randRowCol(jIndex)
    '                    'End If
    '                    flag = True
    '                    'make the prvious val also 0 as it was wrong
    '                    'cel(i, j).assignVal(0)
    '                    'Pop the last value from stack as it is no longer valid
    '                    'stk.Pop()
    '                    'Previosu cell is assigned 0
    '                    filledCount = filledCount - 1
    '                    'Fill the probable values
    '                    fillProbables()
    '                    'hand over to solve sudoku
    '                    fillByRandomBruteForce()
    '                    Return
    '                End If
    '                value = digits(k)
    '                cel(i, j).assignVal(value, False)

    '                'Dim p, q As Integer
    '                'Dim str As String = ""
    '                'For p = 1 To 9
    '                '    For q = 1 To 9
    '                '        str = str & sdk.cel(p, q).value & " "
    '                '    Next
    '                '    str = str & vbCrLf
    '                'Next
    '                'MsgBox(str)
    '                'Next
    '                x = isValidSudokuCell(i, j)
    '            Loop Until (x = 1)
    '            If Not flag Then
    '                'Push the current cell to the stack before j increments
    '                stk.Push(cel(i, j))
    '                filledCount = filledCount + 1
    '                jIndex = jIndex + 1

    '                Dim p, q As Integer
    '                str = ""
    '                For p = 1 To 9
    '                    For q = 1 To 9
    '                        str = str & cel(p, q).value & " "
    '                    Next
    '                    str = str & vbCrLf
    '                Next
    '                MsgBox(str)
    '            End If
    '            flag = False
    '        End While

    '        iIndex = iIndex + 1
    '    End While
    'End Sub
    Public Sub generateSudoku() 'As sudoku

        Dim i, j, k As Integer
        Dim str As String = ""

        flush()
        'initialize()

        'For i = 1 To 9
        '    For j = 1 To 9
        '        For k = 1 To 9
        '            str = str + cel(i, j).probableValues(k).ToString + ","
        '        Next
        '        printToFile("cel(" + i.ToString + "," + j.ToString + "):" + str)
        '        str = ""
        '    Next
        'Next

        For i = 1 To 9
            For j = 1 To 9
                fillProbablesForCell(i, j)
            Next
        Next

        If isLoggingEnabaled Then
            For i = 1 To 9
                For j = 1 To 9
                    For k = 1 To 9
                        str = str + cel(i, j).probableValues(k).ToString + ","
                    Next
                    printToFile("cel(" + i.ToString + "," + j.ToString + "):" + str)
                    str = ""
                Next
            Next
        End If

        fillByBackTracking()
        'Assumed :-)
        filledCount = 81

        'findCandidates(Me)
    End Sub
    Public Function findCandidates() As sudoku
        Dim digits() As Integer
        Dim puzzle As New sudoku
        digits = getRandomArray()
        'digits = {0, 4, 5, 9, 2, 1, 3, 7, 6, 8}
        Dim i, j As Integer
        For i = 1 To 8
            'For j = 1 To 9
            puzzle.cel(digits(i), digits(i + 1)).assignVal(cel(digits(i), digits(i + 1)).value, , True)
            puzzle.cel(10 - digits(i), 10 - digits(i + 1)).assignVal(cel(10 - digits(i), 10 - digits(i + 1)).value, , True)
            'puzzle.cel(digits(i + 1), digits(i)).assignVal(cel(digits(i + 1), digits(i)).value, , True)

            If (i < 6) Then
                puzzle.cel(digits(i), digits(10 - i)).assignVal(cel(digits(i), digits(10 - i)).value, , True)
                puzzle.cel(10 - digits(i), 10 - digits(10 - i)).assignVal(cel(10 - digits(i), 10 - digits(10 - i)).value, , True)
                'puzzle.cel(digits(9 - i + 1), digits(i)).assignVal(cel(digits(9 - i + 1), digits(i)).value, , True)
            End If
            'Next
        Next
       
        Dim flag As Boolean = False
        Dim puzzle1, puzzle2 As sudoku
        Dim k As Integer = 1
        'Dim sdkStack As New Stack

        While (Not flag)
            'sdkStack.Push(puzzle)

            puzzle.cel(digits(k), digits(k + 2)).assignVal(cel(digits(k), digits(k + 2)).value, , True)
            puzzle.cel(10 - digits(k), 10 - digits(k + 2)).assignVal(cel(10 - digits(k), 10 - digits(k + 2)).value, , True)
            puzzle.updateFilledCount()

            puzzle1 = puzzle.copy
            puzzle2 = puzzle.copy

            puzzle.print()

            puzzle1.solve(True)
            puzzle2.solve(False)

            If (puzzle1.compareSolution(puzzle2)) Then
                flag = True
                puzzle.print()
                Exit While
            Else
                'Solution is not unique
                'puzzle = sdkStack.Pop
                If (k < 7) Then
                    k = k + 1
                Else
                    MessageBox.Show("Could not find solution")
                    Exit While
                End If

            End If
            puzzle1.flush()
            puzzle2.flush()
        End While

        'MessageBox.Show(puzzle.filledCount.ToString)

        If (isLoggingEnabaled) Then
            puzzle.printToFile(puzzle.printToString())
        End If

        If (isLoggingEnabaled) Then
            puzzle1.printToFile(puzzle1.printToString())
            puzzle2.printToFile(puzzle2.printToString())
        End If


        Return puzzle
    End Function
    Public Function makeSudoku() As sudoku
        Dim digits() As Integer
        Dim puzzle As New sudoku
        'digits = getRandomArray()
        digits = {0, 4, 5, 9, 2, 1, 3, 7, 6, 8}
        Dim i, j As Integer
        'Copy the complete sudoku and then fill elements
        puzzle = copy()

        For i = 1 To 8
            'For j = 1 To 9
            If (i < 9) Then
                puzzle.cel(digits(i), digits(i + 1)).assignVal(0)
                puzzle.cel(10 - digits(i), 10 - digits(i + 1)).assignVal(0)
                'puzzle.cel(digits(i + 1), digits(i)).assignVal(cel(digits(i + 1), digits(i)).value, , True)
            End If
            puzzle.cel(digits(i), digits(10 - i)).assignVal(0)
            puzzle.cel(10 - digits(i), 10 - digits(10 - i)).assignVal(0)
        Next
        'If (i < 6) Then
        
        'puzzle.cel(digits(9 - i + 1), digits(i)).assignVal(cel(digits(9 - i + 1), digits(i)).value, , True)
        'End If
        'Next


        Dim flag As Boolean = False
        Dim puzzle1, puzzle2 As sudoku
        Dim k As Integer = 1
        'Dim sdkStack As New Stack
        i = 1
        While (Not flag)
            'sdkStack.Push(puzzle)

            puzzle.cel(digits(k), digits(k + 2)).assignVal(0)
            puzzle.cel(10 - digits(k), 10 - digits(k + 2)).assignVal(0)
            puzzle.updateFilledCount()

            puzzle1 = puzzle.copy
            puzzle2 = puzzle.copy

            puzzle.print()
            MessageBox.Show(puzzle.filledCount.ToString)

            puzzle1.solve(True)
            puzzle2.solve(False)

            If (Not puzzle1.compareSolution(puzzle2)) Then
                flag = True
                puzzle.print()
                Exit While
            Else
                'Solution is still unique
                'puzzle = sdkStack.Pop
                'If (i < 9) Then
                'i = i + 1
                'Else
                If (k < 7) Then
                    k = k + 1
                Else
                    MessageBox.Show("Could not find solution")
                    Exit While
                End If

            End If
            puzzle1.flush()
            puzzle2.flush()
        End While

        'MessageBox.Show(puzzle.filledCount.ToString)

        If (isLoggingEnabaled) Then
            puzzle.printToFile(puzzle.printToString())
        End If

        If (isLoggingEnabaled) Then
            puzzle1.printToFile(puzzle1.printToString())
            puzzle2.printToFile(puzzle2.printToString())
        End If


        Return puzzle
    End Function
    Public Sub updateFilledCount()
        Dim i, j As Integer
        filledCount = 0
        For i = 1 To 9
            For j = 1 To 9
                If (cel(i, j).isFilled = True) Then
                    filledCount = filledCount + 1
                End If
            Next
        Next
    End Sub

    Public Function isTwiceInRegn(ByVal rgnRowId As Integer, ByVal rgnColId As Integer, ByVal cel As Cell) As Boolean
        Dim i, j As Integer
        'For i = 1 To 3
        '    For j = 1 To 3
        '        'If (Me.regn(rgnRowId, rgnColId).cells(i, j) = cel.value) Then
        '        If ((cel.value = Me.cel((regn(rgnRowId, rgnColId).cells(i, j).row), (regn(rgnRowId, rgnColId).cells(i, j).col)).value) And
        '            (cel.inRgnRowId <> i) And
        '            (cel.inRgnColId <> j)) Then
        '            Return True
        '        End If
        '    Next j
        'Next i
        'Return False
        For i = (rgnRowId * 3) - 2 To (rgnRowId * 3)
            For j = (rgnColId * 3) - 2 To (rgnColId * 3)
                If ((cel.value = Me.cel(i, j).value) And
                    (cel.RowId <> i) And
                    (cel.ColId <> j)) Then
                    Return True
                End If
            Next
        Next
        Return False
    End Function
    Public Function isTwiceInRow(ByVal cel As Cell) As Boolean
        Dim j As Integer
        For j = 1 To 9
            If (cel.value = Me.cel(cel.RowId, j).value And cel.ColId <> j) Then
                Return True
            End If
        Next j
        Return False
    End Function
    Public Function isTwiceInColumn(ByVal cel As Cell) As Boolean
        Dim i As Integer
        For i = 1 To 9
            If (cel.value = Me.cel(i, cel.ColId).value And i <> cel.RowId) Then
                Return True
            End If
        Next i
        Return False
    End Function

    Function isValidSudoku() As Integer
        Dim i, j As Integer

        For i = 1 To 9
            For j = 1 To 9
                If cel(i, j).value > 0 Then
                    Return isValidSudokuCell(i, j)
                    'If isTwiceInColumn(cel(i, j)) Then
                    '    Return 10
                    'End If

                    'If isTwiceInRow(cel(i, j)) Then
                    '    Return 20
                    'End If

                    'If isTwiceInRegn(cel(i, j).rgnRowId, cel(i, j).rgncolId, cel(i, j)) Then
                    '    Return 30
                    'End If
                End If
            Next
        Next
        Return 1
    End Function
    Function isValidSudokuCell(i As Integer, j As Integer) As Integer
        If isTwiceInColumn(cel(i, j)) Then
            Return 10
        End If

        If isTwiceInRow(cel(i, j)) Then
            Return 20
        End If

        If isTwiceInRegn(cel(i, j).rgnRowId, cel(i, j).rgncolId, cel(i, j)) Then
            Return 30
        End If
        Return 1
    End Function
    Sub initialize()
        Dim i, j, p, q As Integer
        p = 1
        q = 1

        Dim a, b, c, d As Integer
        'Dim atLeatOneNumber As Boolean = False
        a = 1
        c = 1
        For i = 1 To 9
            b = 1
            d = 1
            If ((i - 1) Mod 3 = 0) And (i <> 1) Then
                a = a + 1
                If (a > 3) Then
                    a = 1
                End If
            End If

            For j = 1 To 9
                cel(i, j).value = 0
                'If (sdk.cel(i, j).value > 0) Then
                '    sdk.cel(i, j).isSeed = True
                '    sdk.cel(i, j).isFilled = True
                '    sdk.filledCount = sdk.filledCount + 1
                'End If

                cel(i, j).RowId = i
                cel(i, j).ColId = j

                cel(i, j).rgnRowId = a

                If ((j - 1) Mod 3 = 0) And (j <> 1) Then
                    b = b + 1
                    If (b > 3) Then
                        b = 1
                    End If
                End If
                cel(i, j).rgncolId = b

                cel(i, j).inRgnRowId = c

                cel(i, j).inRgnColId = d
                d = d + 1
                If (d > 3) Then
                    d = 1
                End If

            Next j

            c = c + 1
            If (c > 3) Then
                c = 1
            End If
        Next i
        'Fill the region cell pointers
        fillRegions()
    End Sub
    Private Function getRandomArray() As Integer()
        'Dim RandomClass As New Random()
        Dim RandomNumber As Integer
        Dim i, j As Integer
        Dim flag As Boolean = True
        Dim digits(9) As Integer
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
                'flag = True
            End If
        End While
        Return digits
    End Function
    Public Sub printToFile(ByVal str As String)
        Dim FILE_NAME As String = System.Environment.CurrentDirectory + "\output.txt"
        Dim fStream As System.IO.FileStream

        If Not System.IO.File.Exists(FILE_NAME) Then
            fStream = System.IO.File.Create(FILE_NAME)
            fStream.Close()
        End If

        'Dim objReader As New System.IO.StreamReader(FILE_NAME)
        Dim objWriter As New System.IO.StreamWriter(FILE_NAME, True)

        objWriter.WriteLine(str)
        objWriter.Close()

        'MsgBox("Text written to file")
    End Sub
    Public Function copy() As sudoku
        Dim newSdk As New sudoku
        newSdk.flush()

        Dim i, j As Integer
        For i = 1 To 9
            For j = 1 To 9
                newSdk.cel(i, j).value = Me.cel(i, j).value
                newSdk.cel(i, j).isSeed = Me.cel(i, j).isSeed
                newSdk.cel(i, j).isFilled = Me.cel(i, j).isFilled
            Next
        Next
        newSdk.filledCount = Me.filledCount
        Return newSdk
    End Function
    Public Function compareSolution(ByVal sdk As sudoku) As Boolean
        Dim i, j As Integer
        For i = 1 To 9
            For j = 1 To 9
                If (Not sdk.cel(i, j).value = Me.cel(i, j).value) Then
                    Return False
                End If
            Next
        Next
        Return True
    End Function
End Class



