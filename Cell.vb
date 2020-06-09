Public Class Cell
    Public value As Integer
    Public rgnRowId As Integer
    Public rgncolId As Integer
    Public RowId As Integer
    Public ColId As Integer
    Public inRgnRowId As Integer
    Public inRgnColId As Integer

    Public isSeed As Boolean
    Public isFilled As Boolean
    Public probableValues(9) As Integer
    Public countOfProbables As Integer
    Public currentProbableValUsed As Integer

    Sub New()
        value = 0
        probableValues(9) = New Integer
        countOfProbables = 0
        isSeed = False
        isFilled = False
        currentProbableValUsed = 0
    End Sub
    Public Function isEmpty() As Boolean
        If (value = 0) Then
            Return True
        Else
            Return False
        End If
    End Function

    Public Sub assignVal(ByVal val As Integer, Optional ByVal currentProbableValUsed As Integer = 1, Optional ByVal isSeed As Boolean = False)
        Me.value = val
        If (val > 0) Then
            Me.isFilled = True
            Me.currentProbableValUsed = currentProbableValUsed
            Me.isSeed = isSeed
        Else
            Me.isFilled = False
            Me.countOfProbables = 0
            Me.isSeed = False
            Me.currentProbableValUsed = 0
            Dim i As Integer
            For i = 1 To 9
                Me.probableValues(i) = 0
            Next
        End If
    End Sub
End Class
Public Class region
    Public cells(3, 3) As celPtr
    Sub New()
        Dim i, j As Integer
        For i = 1 To 3
            For j = 1 To 3
                cells(i, j) = New celPtr
            Next j
        Next i
    End Sub
    Public Function isNumPresentInRegion(ByVal num As Integer) As Boolean

    End Function
End Class
Public Class celPtr
    Public row As Integer
    Public col As Integer
End Class
